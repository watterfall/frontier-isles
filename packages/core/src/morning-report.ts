import type { Actor, ActionType, LedgerEvent } from "@frontier-isles/opp";
import type { StationKind } from "./stations";

/**
 * Morning-report projection (ROADMAP Phase B.1 — "morning report drafted from
 * last night's ledger, not seeds"). Reduces the AI night shift's dock drafts
 * into the entries the HITL panel renders; adopt/return decisions are
 * resolved by scanning the ledger for the matching follow-up event, so a page
 * reload reads status from the chain instead of local component state.
 *
 * Candidate filter: a `night_digest` event authored by an **agent** actor
 * whose `ref` resolves to `morning_report` or `dock_proposal` content. Two
 * notes on why, following seed.ts's own convention (see MORNING/DRIFTWOOD
 * there):
 *   - `night_digest` is the one ActionType that both driftwood atoms *and*
 *     morning-report drafts use (no dedicated `create_driftwood`/`attach_*`
 *     verb exists yet — architecture.md §3 debt #5); the ref-kind check is
 *     what actually distinguishes "a night pickup" from "a dock draft
 *     awaiting a human decision".
 *   - actor.kind is filtered to `"agent"` only, not `"pair"`. All three
 *     seeded morning-report drafts are agent-authored (curiosity-scout,
 *     synthesizer, devils-advocate); the one `pair` actor in the seed data
 *     (a human+AI joint draft) is a driftwood atom, not a morning-report
 *     draft. A human/pair-authored `night_digest` would be a manual dock
 *     note, not "what the night shift produced" — the morning report is
 *     specifically the AI side of the HITL chain, so it stays agent-only.
 */

export type MorningReportStatus = "pending" | "adopted" | "returned";

/** Minimal shape of a resolved content-addressed ref (server: `store.getRef`). */
export interface ResolvedRef {
  kind: string;
  content: unknown;
}

export interface MorningReportEntry {
  /** Draft headline, from the resolved ref's `title`/`text` field. */
  title: string;
  /** Proposed destination station (ref content's `dest`/`station`). */
  dest?: StationKind;
  actorId: string;
  actorKind: Actor["kind"];
  credit: string[];
  /** Content-addressed ref of the originating `night_digest` event — the traceability handle back to the ledger. */
  eventRef: string;
  ts: string;
  /** Restored from the ledger: a later `adopt`/`return_to_driftwood` on the same ref resolves it. */
  status: MorningReportStatus;
}

export interface MorningReportOptions {
  /**
   * Resolve a content-addressed ref to its stored kind+content. Injected
   * rather than looked up internally — core stays I/O-free and testable with
   * a plain in-memory map; the server passes `(ref) => store.getRef(ref)`.
   * Without one, no entry can be produced (every draft's identity lives in
   * its ref content) and the projection returns `[]`.
   */
  resolveRef?: (ref: string) => ResolvedRef | undefined;
  /**
   * Window end ("now"). Defaults to the latest ts among candidate events —
   * deliberately NOT `Date.now()` (never a real-clock dependency in a pure
   * projection); ts always comes from the events themselves.
   */
  now?: string;
  /** Window length in ms before `now` — "last night" (default 24h). */
  windowMs?: number;
  /** Explicit window start; overrides `windowMs` when given. */
  since?: string;
}

const DAY_MS = 86_400_000;
const DEFAULT_WINDOW_MS = DAY_MS;

/** Follow-up actions that resolve a draft; `adopt` wins if (implausibly) both exist. */
const RESOLUTION_ACTION: Partial<Record<ActionType, MorningReportStatus>> = {
  adopt: "adopted",
  return_to_driftwood: "returned",
};

interface DraftContent {
  title?: string;
  text?: string;
  dest?: string;
  station?: string;
}

export function projectMorningReport(
  events: readonly LedgerEvent[],
  opts: MorningReportOptions = {},
): MorningReportEntry[] {
  const resolveRef = opts.resolveRef;
  if (!resolveRef) return [];

  const candidates = events.filter((e): e is LedgerEvent & { ref: string } => {
    if (e.action !== "night_digest" || !e.ref || e.actor.kind !== "agent") return false;
    const ref = resolveRef(e.ref);
    return ref?.kind === "morning_report" || ref?.kind === "dock_proposal";
  });
  if (candidates.length === 0) return [];

  const nowMs =
    opts.now !== undefined
      ? new Date(opts.now).getTime()
      : Math.max(...candidates.map((e) => new Date(e.ts).getTime()));
  const windowMs = opts.windowMs ?? DEFAULT_WINDOW_MS;
  const sinceMs = opts.since !== undefined ? new Date(opts.since).getTime() : nowMs - windowMs;

  // Resolution is scanned over the FULL ledger, not window-limited: a human
  // decision naturally lands after the draft (often the next day), so
  // scoping this scan to the same window would read yesterday's already
  // decided drafts as still "pending".
  const resolution = new Map<string, MorningReportStatus>();
  for (const e of events) {
    if (!e.ref) continue;
    const status = RESOLUTION_ACTION[e.action];
    if (status) resolution.set(e.ref, status);
  }

  const out: MorningReportEntry[] = [];
  for (const e of candidates) {
    const ms = new Date(e.ts).getTime();
    if (Number.isNaN(ms) || ms < sinceMs || ms > nowMs) continue;
    const ref = resolveRef(e.ref)!;
    const content = (ref.content ?? {}) as DraftContent;
    out.push({
      title: content.title ?? content.text ?? "",
      dest: (content.dest ?? content.station) as StationKind | undefined,
      actorId: e.actor.id,
      actorKind: e.actor.kind,
      credit: e.credit,
      eventRef: e.ref,
      ts: e.ts,
      status: resolution.get(e.ref) ?? "pending",
    });
  }
  return out.sort((a, b) => a.ts.localeCompare(b.ts));
}
