import {
  LedgerEventSchema,
  hashEvent,
  parseProblemObject,
  serializeProblemObject,
  ProblemObjectSchema,
  verifyChain,
  type Actor,
  type ActionType,
  type FlowType,
  type LedgerEvent,
  type Phase,
  type ProblemObject,
  type ProblemObjectInput,
  type Status,
  type UnchainedEvent,
} from "@frontier-isles/opp";
import {
  STATION_KINDS,
  can,
  degradeAction,
  type GatewayAction,
  type EffectiveAction,
  type StationKind,
  type Role,
} from "@frontier-isles/core";
import {
  projectGrowth,
  computeTide,
  transplantInsight,
  projectContributions,
  projectNightReplay,
} from "@frontier-isles/core";
import type { DB } from "./db.js";
import { refHash, type RefKind } from "./refs.js";

export const ORG = "frontier-isles";
export const opIdFor = (slug: string) => `op://${ORG}/prob/${slug}`;

// ---------------------------------------------------------------------------
// Action → phase / ledger-action / default-station maps
// ---------------------------------------------------------------------------

/** GatewayAction → the concrete ledger ActionType written on the authorized path. */
const LEDGER_ACTION: Record<GatewayAction, ActionType> = {
  found_island: "found_island",
  propose_subquestion: "propose_subquestion",
  bridge_artifact: "bridge_artifact",
  submit_claim: "submit_claim",
  refute: "refute",
  validate: "validate",
  transplant: "transplant",
  return_to_driftwood: "return_to_driftwood",
  publish: "publish",
  adopt: "adopt",
  fork: "fork",
  merge_back: "merge_back",
  bridge_propose: "bridge_propose",
  bridge_accept: "bridge_accept",
  grant_capability: "grant_capability",
  night_digest: "night_digest",
  // MCP write actions with no native ActionType record as a night digest / note.
  create_driftwood: "night_digest",
  attach_data: "night_digest",
  attach_hardware: "night_digest",
};

const DEFAULT_PHASE: Record<GatewayAction, Phase> = {
  found_island: "A",
  propose_subquestion: "A",
  create_driftwood: "A",
  return_to_driftwood: "A",
  night_digest: "A",
  fork: "A",
  bridge_artifact: "B",
  bridge_propose: "B",
  bridge_accept: "B",
  transplant: "B",
  attach_data: "B",
  attach_hardware: "B",
  submit_claim: "D",
  refute: "D",
  validate: "D",
  publish: "D",
  adopt: "D",
  merge_back: "D",
  grant_capability: "D",
};

const DEFAULT_STATION: Partial<Record<GatewayAction, StationKind>> = {
  propose_subquestion: "questions",
  submit_claim: "workshop",
  refute: "workshop",
  validate: "workshop",
  bridge_artifact: "dock",
  transplant: "dock",
  create_driftwood: "driftwood",
  return_to_driftwood: "driftwood",
  attach_data: "data",
  attach_hardware: "workshop",
  publish: "gallery",
  adopt: "gallery",
};

/** Default nine-station L1 layout (grid coords); dock included (§3, DECISIONS 2). */
export const DEFAULT_STATION_LAYOUT: Record<StationKind, { gx: number; gy: number }> = {
  questions: { gx: 2, gy: 0 },
  library: { gx: 1, gy: 0 },
  canvas: { gx: 0, gy: 1 },
  data: { gx: 3, gy: 1 },
  driftwood: { gx: 2, gy: 2 },
  dock: { gx: 4, gy: 2 },
  workshop: { gx: 0, gy: 3 },
  gallery: { gx: 1, gy: 3 },
  tearoom: { gx: 3, gy: 3 },
};

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class GatewayDenied extends Error {
  constructor(public action: string) {
    super(`capability denied for action: ${action}`);
    this.name = "GatewayDenied";
  }
}
export class ChainError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "ChainError";
  }
}
export class NotFound extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "NotFound";
  }
}

// ---------------------------------------------------------------------------
// Row shapes / public types
// ---------------------------------------------------------------------------

export interface ProblemMeta {
  domain: string;
  /** L0 chart display name (may differ from the object title, e.g. sample island). */
  name?: string;
  chart: { x: number; y: number; scale: number; activity: number; members?: number };
}

export interface StationRow {
  kind: StationKind;
  gx: number;
  gy: number;
  level: number;
}

export interface MembershipRow {
  actorId: string;
  kind: string;
  role: string | null;
  aiKind: string | null;
}

export interface GatewayInput {
  actor: Actor;
  gatewayAction: GatewayAction;
  phase?: Phase;
  credit?: string[];
  flow?: FlowType;
  payload?: unknown;
  refKind?: RefKind;
  station?: StationKind;
  placementMeta?: Record<string, unknown>;
  ts?: string;
  /** Optimistic-concurrency guard: must equal the current head hash. */
  expectPrev?: string;
}

export interface GatewayResult {
  event: LedgerEvent;
  degraded: boolean;
  effectiveAction: EffectiveAction;
  refHash?: string;
  proposalHash?: string;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export class Store {
  constructor(public db: DB) {}

  // --- refs -----------------------------------------------------------------

  putRef(kind: RefKind, content: unknown): string {
    const hash = refHash(content);
    this.db
      .prepare("INSERT OR IGNORE INTO refs (hash, kind, json) VALUES (?, ?, ?)")
      .run(hash, kind, JSON.stringify(content));
    return hash;
  }

  getRef(hash: string): { kind: string; content: unknown } | undefined {
    const row = this.db.prepare("SELECT kind, json FROM refs WHERE hash = ?").get(hash) as
      | { kind: string; json: string }
      | undefined;
    return row ? { kind: row.kind, content: JSON.parse(row.json) } : undefined;
  }

  // --- problem objects ------------------------------------------------------

  hasIslands(): boolean {
    const row = this.db.prepare("SELECT COUNT(*) AS n FROM problem_objects").get() as { n: number };
    return row.n > 0;
  }

  getProblemRow(slug: string):
    | { opId: string; slug: string; md: string; meta: ProblemMeta; object: ProblemObject }
    | undefined {
    const row = this.db
      .prepare("SELECT op_id, slug, md_source, json FROM problem_objects WHERE slug = ?")
      .get(slug) as { op_id: string; slug: string; md_source: string; json: string } | undefined;
    if (!row) return undefined;
    const { object } = parseProblemObject(row.md_source);
    return {
      opId: row.op_id,
      slug: row.slug,
      md: row.md_source,
      meta: JSON.parse(row.json) as ProblemMeta,
      object,
    };
  }

  listProblemRows(): Array<{ opId: string; slug: string; md: string; meta: ProblemMeta }> {
    const rows = this.db
      .prepare("SELECT op_id, slug, md_source, json FROM problem_objects ORDER BY slug")
      .all() as Array<{ op_id: string; slug: string; md_source: string; json: string }>;
    return rows.map((r) => ({
      opId: r.op_id,
      slug: r.slug,
      md: r.md_source,
      meta: JSON.parse(r.json) as ProblemMeta,
    }));
  }

  /** Insert a problem object (knowledge plane). Idempotent on op_id. */
  insertProblem(object: ProblemObject, md: string, meta: ProblemMeta): void {
    this.db
      .prepare(
        `INSERT OR IGNORE INTO problem_objects (op_id, slug, md_source, title, status, qfocus, json)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        object.id,
        slugOf(object.id),
        md,
        object.title,
        object.status,
        object.qfocus,
        JSON.stringify(meta),
      );
  }

  // --- ledger ---------------------------------------------------------------

  getEvents(opId: string): LedgerEvent[] {
    const rows = this.db
      .prepare("SELECT json FROM ledger_events WHERE op_id = ? ORDER BY seq")
      .all(opId) as Array<{ json: string }>;
    return rows.map((r) => JSON.parse(r.json) as LedgerEvent);
  }

  lastHash(opId: string): string | undefined {
    const row = this.db
      .prepare("SELECT hash FROM ledger_events WHERE op_id = ? ORDER BY seq DESC LIMIT 1")
      .get(opId) as { hash: string } | undefined;
    return row?.hash;
  }

  /**
   * Append-only, hash-chained write. `prev` is always the current head hash;
   * the chain can never be broken by this path. If `expectPrev` is supplied it
   * must equal the head (optimistic concurrency), else {@link ChainError}.
   * The event is validated by LedgerEventSchema before insertion.
   */
  appendRaw(opId: string, partial: UnchainedEvent, expectPrev?: string): LedgerEvent {
    const prev = this.lastHash(opId);
    if (expectPrev !== undefined && expectPrev !== (prev ?? "")) {
      throw new ChainError(`prev mismatch: expected head ${prev ?? "<genesis>"}, got ${expectPrev}`);
    }
    const event = LedgerEventSchema.parse({ ...partial, prev });
    const hash = hashEvent(event);
    this.db
      .prepare("INSERT INTO ledger_events (op_id, hash, prev, json) VALUES (?, ?, ?, ?)")
      .run(opId, hash, prev ?? null, JSON.stringify(event));
    return event;
  }

  verify(opId: string) {
    return verifyChain(this.getEvents(opId));
  }

  // --- place plane ----------------------------------------------------------

  createStations(opId: string, layout = DEFAULT_STATION_LAYOUT): void {
    const stmt = this.db.prepare(
      "INSERT OR IGNORE INTO stations (op_id, kind, gx, gy, level) VALUES (?, ?, ?, ?, ?)",
    );
    for (const kind of STATION_KINDS) {
      const p = layout[kind];
      stmt.run(opId, kind, p.gx, p.gy, 1);
    }
  }

  getStations(opId: string): StationRow[] {
    const rows = this.db
      .prepare("SELECT kind, gx, gy, level FROM stations WHERE op_id = ?")
      .all(opId) as Array<{ kind: string; gx: number; gy: number; level: number }>;
    return rows.map((r) => ({ kind: r.kind as StationKind, gx: r.gx, gy: r.gy, level: r.level }));
  }

  addPlacement(
    opId: string,
    station: StationKind,
    refHashValue: string | null,
    meta: Record<string, unknown>,
  ): number {
    const info = this.db
      .prepare("INSERT INTO placements (op_id, station, ref_hash, meta_json) VALUES (?, ?, ?, ?)")
      .run(opId, station, refHashValue, JSON.stringify(meta));
    return Number(info.lastInsertRowid);
  }

  getPlacements(opId: string, station?: StationKind) {
    const rows = station
      ? (this.db
          .prepare("SELECT id, station, ref_hash, meta_json FROM placements WHERE op_id = ? AND station = ? ORDER BY id")
          .all(opId, station) as Array<{ id: number; station: string; ref_hash: string | null; meta_json: string }>)
      : (this.db
          .prepare("SELECT id, station, ref_hash, meta_json FROM placements WHERE op_id = ? ORDER BY id")
          .all(opId) as Array<{ id: number; station: string; ref_hash: string | null; meta_json: string }>);
    return rows.map((r) => ({
      id: r.id,
      station: r.station as StationKind,
      refHash: r.ref_hash,
      meta: JSON.parse(r.meta_json) as Record<string, unknown>,
    }));
  }

  addMembership(opId: string, m: MembershipRow): void {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO memberships (op_id, actor_id, actor_kind, role, ai_kind)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(opId, m.actorId, m.kind, m.role, m.aiKind);
  }

  getMemberships(opId: string): MembershipRow[] {
    const rows = this.db
      .prepare("SELECT actor_id, actor_kind, role, ai_kind FROM memberships WHERE op_id = ? ORDER BY actor_id")
      .all(opId) as Array<{ actor_id: string; actor_kind: string; role: string | null; ai_kind: string | null }>;
    // Presence-shaped: identity + role only. Never online-duration (克制原则).
    return rows.map((r) => ({
      actorId: r.actor_id,
      kind: r.actor_kind,
      role: r.role,
      aiKind: r.ai_kind,
    }));
  }

  memberRole(opId: string, actorId: string): Role | undefined {
    const row = this.db
      .prepare("SELECT role FROM memberships WHERE op_id = ? AND actor_id = ?")
      .get(opId, actorId) as { role: string | null } | undefined;
    return (row?.role ?? undefined) as Role | undefined;
  }

  grantsFor(opId: string, agentId: string): string[] {
    const rows = this.db
      .prepare("SELECT capability FROM capability_grants WHERE op_id = ? AND agent_id = ?")
      .all(opId, agentId) as Array<{ capability: string }>;
    return rows.map((r) => r.capability);
  }

  addGrant(opId: string, agentId: string, capability: string, grantedBy: string, eventHash: string): void {
    this.db
      .prepare(
        `INSERT OR IGNORE INTO capability_grants (op_id, agent_id, capability, granted_by, event_hash)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(opId, agentId, capability, grantedBy, eventHash);
  }

  // --- capability gateway ---------------------------------------------------

  /**
   * The single write path for knowledge events (§4 AI governance, invariant 6).
   * Runs core.can + degradeAction: an ungranted agent push is parked at the dock
   * as a proposal (dock_proposal → a `night_digest` event + a dock placement)
   * rather than denied; a non-degradable denial (e.g. a visitor granting caps)
   * throws {@link GatewayDenied}. Authorized actions pass through to their native
   * ledger ActionType.
   */
  gateway(opId: string, input: GatewayInput): GatewayResult {
    const { actor, gatewayAction } = input;
    const ts = input.ts ?? new Date().toISOString();
    const role = actor.kind === "agent" ? undefined : this.memberRole(opId, actor.id);
    const capActor = { id: actor.id, kind: actor.kind, role };
    const grants = this.grantsFor(opId, actor.id);

    const allowed = can(capActor, gatewayAction, grants);
    const effective = degradeAction(capActor, gatewayAction, grants);

    const payloadHash =
      input.payload !== undefined
        ? this.putRef(input.refKind ?? "note", input.payload)
        : undefined;

    if (effective === "dock_proposal") {
      const proposal = {
        originalAction: gatewayAction,
        actor,
        payloadHash: payloadHash ?? null,
        payload: input.payload ?? null,
        station: input.station ?? DEFAULT_STATION[gatewayAction] ?? "dock",
        at: ts,
      };
      const proposalHash = this.putRef("dock_proposal", proposal);
      this.addPlacement(opId, "dock", proposalHash, {
        kind: "proposal",
        originalAction: gatewayAction,
        actorId: actor.id,
        dest: proposal.station,
        resolved: false,
      });
      const event = this.appendRaw(
        opId,
        {
          ts,
          op: opId as ProblemObject["id"],
          actor,
          credit: input.credit ?? ["credit:ai/proposal"],
          phase: "A",
          action: "night_digest",
          ref: proposalHash,
        },
        input.expectPrev,
      );
      return { event, degraded: true, effectiveAction: "dock_proposal", refHash: payloadHash, proposalHash };
    }

    if (!allowed) throw new GatewayDenied(gatewayAction);

    const action = LEDGER_ACTION[gatewayAction];
    const phase = input.phase ?? DEFAULT_PHASE[gatewayAction];
    const station = input.station ?? DEFAULT_STATION[gatewayAction];

    const event = this.appendRaw(
      opId,
      {
        ts,
        op: opId as ProblemObject["id"],
        actor,
        credit: input.credit ?? [],
        phase,
        action,
        flow: input.flow,
        ref: payloadHash,
      },
      input.expectPrev,
    );

    if (station && payloadHash) {
      this.addPlacement(opId, station, payloadHash, {
        action,
        actorId: actor.id,
        ...(input.placementMeta ?? {}),
      });
    }

    // grant_capability side-effect on the place plane.
    if (gatewayAction === "grant_capability") {
      const p = (input.payload ?? {}) as { agent?: string; capability?: string };
      if (p.agent && p.capability) {
        this.addGrant(opId, p.agent, p.capability, actor.id, hashEvent(event));
      }
    }

    return { event, degraded: false, effectiveAction: action, refHash: payloadHash };
  }

  // --- founding ceremony ----------------------------------------------------

  /**
   * The founding ceremony (§4): builds & validates the problem object via opp,
   * serializes the `.md`, then writes the genesis `found_island` event plus one
   * `propose_subquestion` per question — all hash-chained. The ceremony log is
   * stored as the genesis event's ref. Creates the nine default stations and
   * seats the founder as master. The ceremony IS the head of the ledger.
   */
  foundIsland(input: {
    slug: string;
    title: string;
    name: string;
    qfocus: string;
    domain: string;
    questions: Array<{ text: string; open: boolean; rewrittenFrom?: string }>;
    votes: Record<string, number>;
    ceremonyLog: string[];
    actor: Actor;
    status?: Status;
    chart?: { x: number; y: number; scale: number; activity: number };
    ts?: string;
  }) {
    const opId = opIdFor(input.slug);
    if (this.getProblemRow(input.slug)) throw new ChainError(`island already exists: ${input.slug}`);

    const openQs = input.questions.filter((q) => q.open).map((q) => `- ${q.text}`).join("\n");
    const body = [
      "## Night",
      "",
      `建岛仪式 · ${input.name}。QFT 一轮聚焦为 QFocus。此夜永存于夜晚层。`,
      "",
      "## Open sub-questions",
      "",
      openQs || "- (none yet)",
      "",
    ].join("\n");

    const raw: ProblemObjectInput = {
      schema: "opp/0.2",
      id: opId,
      title: input.title,
      status: input.status ?? "open",
      qfocus: input.qfocus,
    };
    const object = ProblemObjectSchema.parse(raw);
    const parsedBody = parseProblemObject(serializeProblemObject(object, { raw: body })).body;
    const md = serializeProblemObject(object, parsedBody);

    const meta: ProblemMeta = {
      domain: input.domain,
      chart: input.chart ?? { x: 1108, y: 742, scale: 0.8, activity: 5 },
    };

    const tx = this.db.transaction(() => {
      this.insertProblem(object, md, meta);
      this.addMembership(opId, {
        actorId: input.actor.id,
        kind: input.actor.kind,
        role: "master",
        aiKind: null,
      });
      this.createStations(opId);

      const baseTs = input.ts ? new Date(input.ts).getTime() : Date.now();
      let n = 0;
      const nextTs = () => new Date(baseTs + n++ * 1000).toISOString();

      const ceremonyRef = this.putRef("ceremony", {
        name: input.name,
        qfocus: input.qfocus,
        ceremonyLog: input.ceremonyLog,
        votes: input.votes,
      });
      this.appendRaw(opId, {
        ts: nextTs(),
        op: opId as ProblemObject["id"],
        actor: input.actor,
        credit: ["conceptualization"],
        phase: "A",
        action: "found_island",
        ref: ceremonyRef,
      });

      input.questions.forEach((q, idx) => {
        const qRef = this.putRef("question", {
          text: q.text,
          open: q.open,
          rewrittenFrom: q.rewrittenFrom ?? null,
          votes: input.votes[String(idx)] ?? 0,
        });
        const ev = this.appendRaw(opId, {
          ts: nextTs(),
          op: opId as ProblemObject["id"],
          actor: input.actor,
          credit: ["conceptualization"],
          phase: "A",
          action: "propose_subquestion",
          ref: qRef,
        });
        this.addPlacement(opId, "questions", qRef, {
          action: "propose_subquestion",
          open: q.open,
          hash: hashEvent(ev),
        });
      });
    });
    tx();

    return this.islandDetail(input.slug);
  }

  // --- projections / views --------------------------------------------------

  islandSummary(slug: string) {
    const row = this.getProblemRow(slug);
    if (!row) throw new NotFound(slug);
    const events = this.getEvents(row.opId);
    const growth = projectGrowth(events, { status: row.object.status, now: new Date() });
    const tide = computeTide(events);
    const members = Math.max(this.getMemberships(row.opId).length, row.meta.chart.members ?? 0);
    return {
      opId: row.opId,
      slug: row.slug,
      title: row.object.title,
      name: row.meta.name ?? row.object.title,
      qfocus: row.object.qfocus,
      domain: row.meta.domain,
      status: row.object.status,
      lineage: row.object.lineage,
      chart: row.meta.chart,
      growth,
      tide,
      members,
      activity: row.meta.chart.activity,
    };
  }

  listIslands() {
    return this.listProblemRows().map((r) => this.islandSummary(r.slug));
  }

  islandDetail(slug: string) {
    const row = this.getProblemRow(slug);
    if (!row) throw new NotFound(slug);
    const events = this.getEvents(row.opId);
    const parsed = parseProblemObject(row.md);
    return {
      opId: row.opId,
      slug: row.slug,
      object: parsed.object,
      body: parsed.body,
      md: row.md,
      domain: row.meta.domain,
      chart: row.meta.chart,
      stations: this.getStations(row.opId),
      memberships: this.getMemberships(row.opId),
      growth: projectGrowth(events, { status: parsed.object.status, now: new Date() }),
      tide: computeTide(events),
      insight: transplantInsight(events),
      contributions: projectContributions(events),
      eventCount: events.length,
      morningReport: this.morningReport(row.opId),
    };
  }

  /** Ledger stream with resolved ref payloads joined in (for night replay). */
  eventStream(slug: string, upTo?: number) {
    const row = this.getProblemRow(slug);
    if (!row) throw new NotFound(slug);
    const events = this.getEvents(row.opId);
    const replay = projectNightReplay(events, upTo);
    const enriched = replay.map((s) => ({
      index: s.index,
      event: s.event,
      ghost: s.ghost,
      ref: s.event.ref ? this.getRef(s.event.ref) : undefined,
    }));
    return { opId: row.opId, total: events.length, slices: enriched };
  }

  // --- morning report (dock HITL) ------------------------------------------

  morningReport(opId: string) {
    const events = this.getEvents(opId);
    const resolved = new Set(
      events
        .filter((e) => (e.action === "adopt" || e.action === "return_to_driftwood") && e.ref)
        .map((e) => e.ref),
    );
    const drafts: Array<{
      refHash: string;
      kind: string;
      content: unknown;
      ts: string;
      actor: Actor;
    }> = [];
    for (const e of events) {
      if (e.action !== "night_digest" || !e.ref || resolved.has(e.ref)) continue;
      const ref = this.getRef(e.ref);
      if (!ref) continue;
      if (ref.kind !== "morning_report" && ref.kind !== "dock_proposal") continue;
      drafts.push({ refHash: e.ref, kind: ref.kind, content: ref.content, ts: e.ts, actor: e.actor });
    }
    return drafts;
  }

  /** Adopt (joint human+AI credit) or return a dock draft — full HITL into ledger. */
  resolveMorningReport(
    slug: string,
    refHashValue: string,
    decision: "adopt" | "return",
    actor: Actor,
    ts?: string,
  ): GatewayResult {
    const row = this.getProblemRow(slug);
    if (!row) throw new NotFound(slug);
    const opId = row.opId;
    const draftEvent = this.getEvents(opId).find(
      (e) => e.action === "night_digest" && e.ref === refHashValue,
    );
    if (!draftEvent) throw new NotFound(`draft ${refHashValue}`);
    const ref = this.getRef(refHashValue);
    const content = (ref?.content ?? {}) as { credit?: string[]; dest?: string; station?: string };
    const when = ts ?? new Date().toISOString();

    // Mark any dock placement resolved.
    for (const pl of this.getPlacements(opId, "dock")) {
      if (pl.refHash === refHashValue && pl.meta.resolved === false) {
        this.db
          .prepare("UPDATE placements SET meta_json = ? WHERE id = ?")
          .run(JSON.stringify({ ...pl.meta, resolved: true, decision }), pl.id);
      }
    }

    if (decision === "adopt") {
      const aiCredit = (content.credit ?? ["credit:ai/synthesis"]).filter((c) => c.startsWith("credit:ai/"));
      const credit = Array.from(new Set(["curation", ...(aiCredit.length ? aiCredit : ["credit:ai/synthesis"])]));
      const event = this.appendRaw(opId, {
        ts: when,
        op: opId as ProblemObject["id"],
        actor: { id: actor.id, kind: "pair" },
        credit,
        phase: "D",
        action: "adopt",
        ref: refHashValue,
      });
      const dest = (content.dest ?? content.station ?? "gallery") as StationKind;
      this.addPlacement(opId, dest, refHashValue, { action: "adopt", actorId: actor.id, from: "dock" });
      return { event, degraded: false, effectiveAction: "adopt", refHash: refHashValue };
    }

    const event = this.appendRaw(opId, {
      ts: when,
      op: opId as ProblemObject["id"],
      actor,
      credit: ["curation"],
      phase: "A",
      action: "return_to_driftwood",
      ref: refHashValue,
    });
    this.addPlacement(opId, "driftwood", refHashValue, { action: "return_to_driftwood", actorId: actor.id });
    return { event, degraded: false, effectiveAction: "return_to_driftwood", refHash: refHashValue };
  }

  // --- sessions -------------------------------------------------------------

  createSession(handle: string): { token: string; actor: Actor } {
    const token = randomToken();
    const actor: Actor = { id: `github:${handle}`, kind: "human" };
    this.db
      .prepare(
        "INSERT INTO sessions (token, actor_id, actor_kind, handle, created_at) VALUES (?, ?, ?, ?, ?)",
      )
      .run(token, actor.id, actor.kind, handle, new Date().toISOString());
    return { token, actor };
  }

  sessionActor(token: string | undefined): Actor | undefined {
    if (!token) return undefined;
    const row = this.db
      .prepare("SELECT actor_id, actor_kind FROM sessions WHERE token = ?")
      .get(token) as { actor_id: string; actor_kind: string } | undefined;
    return row ? { id: row.actor_id, kind: row.actor_kind as Actor["kind"] } : undefined;
  }

  deleteSession(token: string | undefined): void {
    if (!token) return;
    this.db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
  }
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

export function slugOf(opId: string): string {
  const m = /\/prob\/([^/]+)$/.exec(opId);
  return m?.[1] ?? opId;
}

function randomToken(): string {
  return refHash({ t: Date.now(), r: Math.random() }).slice(7, 39);
}
