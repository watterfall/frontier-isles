import { z } from "zod";
import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils";
import { OpId } from "./problem-object";

/**
 * Ledger event schema — the append-only, hash-chained record that is the sole
 * source of attribution truth (architecture.md §5). Contribution profiles and
 * night-science aggregates are `reduce`s over these events; the `.md`
 * `night_science` block is never hand-edited.
 */

export const PhaseSchema = z.enum(["A", "B", "D"]);
export type Phase = z.infer<typeof PhaseSchema>;

export const ActorKindSchema = z.enum(["human", "agent", "pair"]);
export type ActorKind = z.infer<typeof ActorKindSchema>;

export const ActionTypeSchema = z.enum([
  "found_island",
  "propose_subquestion",
  "bridge_artifact",
  "submit_claim",
  "refute",
  "validate",
  "transplant",
  "return_to_driftwood",
  "publish",
  "adopt",
  "fork",
  "merge_back",
  "bridge_propose",
  "bridge_accept",
  "grant_capability",
  "night_digest",
]);
export type ActionType = z.infer<typeof ActionTypeSchema>;

/** The six cross-layer flows (architecture.md §4). */
export const FlowTypeSchema = z.enum([
  "hypothesis-output",
  "anomaly-input",
  "constraint-transfer",
  "metaphor-bridge",
  "question-return",
  "method-transfer",
]);
export type FlowType = z.infer<typeof FlowTypeSchema>;

export const ActorSchema = z.object({
  id: z.string().regex(/^(did:|orcid:|github:)/, "actor id must be did:/orcid:/github: prefixed"),
  kind: ActorKindSchema,
});
export type Actor = z.infer<typeof ActorSchema>;

export const LedgerEventSchema = z.object({
  ts: z.string().datetime({ offset: true }),
  op: OpId,
  actor: ActorSchema,
  /** CRediT roles plus AI-specific `credit:ai/*` roles. */
  credit: z.array(z.string()).default([]),
  phase: PhaseSchema,
  action: ActionTypeSchema,
  flow: FlowTypeSchema.optional(),
  ref: z.string().optional(),
  prev: z.string().optional(),
  sig: z.string().optional(),
});
export type LedgerEvent = z.infer<typeof LedgerEventSchema>;

/**
 * Canonical JSON: recursively sorted keys, `undefined` dropped. Deterministic
 * and browser-safe (no node:crypto, no key-order assumptions).
 */
export function canonicalStringify(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(record).sort()) {
      const v = record[key];
      if (v === undefined) continue;
      out[key] = canonicalize(v);
    }
    return out;
  }
  return value;
}

/**
 * Content hash of an event over canonical JSON. The `sig` field is excluded: a
 * signature is taken *over* the hash, so it can never be part of the hashed
 * content. `prev` is included, which is what makes the chain tamper-evident.
 */
export function hashEvent(event: LedgerEvent): string {
  const { sig: _sig, ...content } = event;
  const bytes = utf8ToBytes(canonicalStringify(content));
  return `sha256:${bytesToHex(sha256(bytes))}`;
}

/** An event ready to append; `prev` is filled by {@link appendEvent}. */
export type UnchainedEvent = Omit<LedgerEvent, "prev">;

/**
 * Append an event to a chain, linking `prev` to the last event's hash (the
 * genesis event gets no `prev`). Validates the event before appending and
 * returns a new array — inputs are not mutated.
 */
export function appendEvent(chain: readonly LedgerEvent[], partial: UnchainedEvent): LedgerEvent[] {
  const last = chain.length > 0 ? chain[chain.length - 1] : undefined;
  const prev = last ? hashEvent(last) : undefined;
  const event = LedgerEventSchema.parse({ ...partial, prev });
  return [...chain, event];
}

export interface ChainVerification {
  ok: boolean;
  /** Index of the first event whose `prev` does not match its predecessor. */
  brokenAt?: number;
}

/**
 * Verify the hash chain. Detects tampering with, or reordering of, any event
 * except the last (the terminal link needs external anchoring — §5 Merkle
 * root / OpenTimestamps). Returns the index of the first broken link.
 */
export function verifyChain(events: readonly LedgerEvent[]): ChainVerification {
  for (let i = 1; i < events.length; i++) {
    const expected = hashEvent(events[i - 1]!);
    if (events[i]!.prev !== expected) return { ok: false, brokenAt: i };
  }
  return { ok: true };
}

export interface NightScienceCounts {
  A: number;
  B: number;
  D: number;
}

/**
 * Aggregate night-science phase counts from the ledger. This is the only
 * sanctioned way to produce the `.md` `night_science` block.
 */
export function reduceNightScience(events: readonly LedgerEvent[]): NightScienceCounts {
  const counts: NightScienceCounts = { A: 0, B: 0, D: 0 };
  for (const event of events) counts[event.phase] += 1;
  return counts;
}
