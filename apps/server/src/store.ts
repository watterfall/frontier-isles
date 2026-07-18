import {
  LedgerEventSchema,
  hashEvent,
  parseProblemObject,
  serializeProblemObject,
  parseStructureObject,
  serializeStructureObject,
  ProblemObjectSchema,
  verifyChain,
  type StructureObject,
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
  hasClaimEvidence,
  projectGrowth,
  computeTide,
  transplantInsight,
  projectContributions,
  projectNightReplay,
  projectCurrents,
  projectWhirlpools,
  projectMorningReport,
  buildTransplant,
  projectStructureMappings,
  reduceStructureGraph,
  structureFrontier,
  type BridgeArtifactType,
  type Current,
  type Whirlpool,
  type MorningReportEntry,
  type MappingArtifact,
  type StructureEdge,
  type StructureFrontier,
  type StructureMappingRecord,
} from "@frontier-isles/core";
import { domainToVec, type IslandInterior } from "@frontier-isles/data";
import type { DB } from "./db.js";
import { refHash, type RefKind } from "./refs.js";
import { dispatchNightDigest } from "./webhook.js";
import { randomBytes } from "node:crypto";

export const ORG = "frontier-isles";
export const opIdFor = (slug: string) => `op://${ORG}/prob/${slug}`;

/** Wide-open window start for `morningReport` — the dock is a standing inbox, not a 24h window. */
const EPOCH = "1970-01-01T00:00:00.000Z";

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
  rebuild: "rebuild",
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
  rebuild: "B",
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
  rebuild: "dock",
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
/**
 * A refute/validate write whose payload carries no evidence-role data ref
 * (architecture §4 Claims & evidence). This is RECORD HONESTY, not capability:
 * it is a hard rejection (HTTP 422 / MCP tool error), never a silent dock
 * degradation, and it applies only to NEW writes — historical events in an
 * existing DB still project (write-side strict, read-side tolerant).
 */
export class EvidenceRequired extends Error {
  constructor(public action: string) {
    super(
      `${action} must reference an evidence-role data ref (§4): payload must be ` +
        `{ ro_crate, role: "evidence"|"replication", hash: "sha256:…" } or embed one under "evidence"`,
    );
    this.name = "EvidenceRequired";
  }
}
export class NotFound extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "NotFound";
  }
}

export type PassageInvalidReason =
  | "source_required"
  | "prediction_required"
  | "boundary_required"
  | "same_island"
  | "mapping_target_mismatch"
  | "source_unverified";

/** A structurally valid mapping that cannot truthfully become a passage edge. */
export class PassageInvalid extends Error {
  constructor(public reason: PassageInvalidReason, message: string) {
    super(message);
    this.name = "PassageInvalid";
  }
}

export type ConnectionResponseInvalidReason =
  | "target_required"
  | "target_unanchored"
  | "same_island"
  | "body_required"
  | "test_required"
  | "language_invalid";

/** A response that cannot truthfully become evidence for or against a cross-island claim. */
export class ConnectionResponseInvalid extends Error {
  constructor(public reason: ConnectionResponseInvalidReason, message: string) {
    super(message);
    this.name = "ConnectionResponseInvalid";
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
  /** Curated frontier metadata from the xfrontier atlas (place-plane; the OPP
   *  `frontier` field stays lean — heat/substrate derived from these scores). */
  atlas?: {
    atlasN: number;
    scores: number[];
    cluster: { code: string; zh: string; en: string };
    citation: { url: string; title: string; venue: string; year: number };
    brief: { zh: string; en: string };
    outlier?: boolean;
    /** Full grounded evidence list (real citations) — feeds the island library +
     *  problem.md 参考文献 (§九 Phase 1). From FrontierEntry.literature. */
    literature?: { title: string; venue: string; year: number; url: string }[];
    /** Grounded deep content (overview/whyMatters/ifAnswered/approaches/barrier/
     *  subQuestions) — feeds the L1 detail dossier + problem.md body so opening
     *  an island is never empty. From @frontier-isles/data FrontierEntry.depth. */
    depth?: {
      overview: { zh: string; en: string };
      whyMatters: { zh: string; en: string };
      ifAnswered: { zh: string; en: string };
      approaches: { zh: string; en: string }[];
      barrier: { zh: string; en: string };
      subQuestions: { zh: string; en: string }[];
    };
    /** Rich flagship-island station interior (Question Wall / library digests /
     *  whiteboard debates / data desk / driftwood / residents). From
     *  @frontier-isles/data FrontierEntry.interior; feeds the L1 station drawers
     *  so opening a curated island is as full as the sample island. */
    interior?: IslandInterior;
  };
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

export interface RebuildPassageResult extends GatewayResult {
  passageKind: "charted" | "frontier";
  structureId: string;
  sourceIslandOp: string;
  targetIslandOp: string;
}

export interface ConnectionResponseInput {
  targetRef: string;
  action: "validate" | "refute";
  body: string;
  test: string;
  evidence: unknown;
  actor: Actor;
  language?: "zh" | "en";
  credit?: string[];
  ts?: string;
}

export interface ConnectionResponseResult extends GatewayResult {
  targetRef: string;
  responseRef: string;
  sourceIslandOp: string;
  respondingIslandOp: string;
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

  /**
   * The sea plane (depth-plan-v2 §3) as a pure projection over the WHOLE ledger:
   * cross-island currents + whirlpools, plus each island's place-plane coordinate
   * (manifold `vec` from domain, abstractness `substrate` from the atlas score, or
   * null when unknown → no sea depth). No new verb, no relation store — invariant 15.
   */
  seaData(): {
    currents: Current[];
    whirlpools: Whirlpool[];
    islands: Array<{
      op: string;
      name: string;
      domain: string;
      vec: [number, number];
      substrate: number | null;
      chart: { x: number; y: number };
    }>;
  } {
    const rows = this.listProblemRows();
    const events: LedgerEvent[] = [];
    for (const r of rows) events.push(...this.getEvents(r.opId));
    const islands = rows.map((r) => {
      const s = r.meta.atlas?.scores;
      const substrate = s && typeof s[6] === "number" ? s[6] / 5 : null;
      return {
        op: r.opId,
        name: r.meta.name ?? r.slug,
        domain: r.meta.domain,
        vec: domainToVec(r.meta.domain),
        substrate,
        chart: { x: r.meta.chart.x, y: r.meta.chart.y },
      };
    });
    const resolveRef = (ref: string) => this.getRef(ref);
    return {
      currents: projectCurrents(events, resolveRef),
      whirlpools: projectWhirlpools(events, resolveRef),
      islands,
    };
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

  // --- structures (执行纲要 §九, knowledge plane) ----------------------------

  /** Upsert a catalogued structure object. md_source is authoritative +
   *  round-trips (§6). Seed reconciliation calls this only for known catalog
   *  ids; user-created ids remain untouched. */
  insertStructure(object: StructureObject): void {
    const slug = structSlugOf(object.id);
    this.db
      .prepare(
        `INSERT INTO structure_objects (id, slug, md_source, status) VALUES (?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           slug = excluded.slug,
           md_source = excluded.md_source,
           status = excluded.status`,
      )
      .run(object.id, slug, serializeStructureObject(object), object.status);
  }

  /** All structures (parsed from their authoritative md). */
  listStructures(): StructureObject[] {
    const rows = this.db
      .prepare("SELECT md_source FROM structure_objects ORDER BY id")
      .all() as { md_source: string }[];
    return rows.map((r) => parseStructureObject(r.md_source));
  }

  /** One structure by slug — object + raw md (for the .md leavability route). */
  getStructure(slug: string): { object: StructureObject; md: string } | undefined {
    const row = this.db
      .prepare("SELECT md_source FROM structure_objects WHERE slug = ?")
      .get(slug) as { md_source: string } | undefined;
    if (!row) return undefined;
    return { object: parseStructureObject(row.md_source), md: row.md_source };
  }

  /**
   * The 结构 ⇄ 现象 bipartite graph as a pure reduce over the WHOLE ledger
   * (执行纲要 §九): rebuild events whose ref resolves to a mapping become edges;
   * structureFrontier then derives each structure's rebuilt islands + near gaps.
   * No edge is stored — this is `reduce`, not a relation table (inv 14/15).
   */
  structureGraph(): { edges: StructureEdge[]; frontier: StructureFrontier[]; mappings: StructureMappingRecord[] } {
    const rows = this.listProblemRows();
    const events: LedgerEvent[] = [];
    for (const r of rows) events.push(...this.getEvents(r.opId));
    const resolveRef = (ref: string): MappingArtifact | null => {
      const r = this.getRef(ref);
      return r && r.kind === "mapping" ? (r.content as MappingArtifact) : null;
    };
    const edges = reduceStructureGraph(events, resolveRef);
    const mappings = projectStructureMappings(events, resolveRef);
    const islands = rows.map((r) => ({
      op: r.opId,
      domain: r.meta.domain,
      cluster: r.meta.atlas?.cluster.code,
    }));
    return { edges, frontier: structureFrontier(edges, islands), mappings };
  }

  /**
   * Complete one human-authored Ferry Dock passage. The departure must already
   * carry a real rebuild edge for this structure; the destination may either be
   * another charted edge (practice) or a true gap (frontier research). Both
   * paths write the exact same mapping ref + rebuild event. The label is derived
   * from the destination graph before mutation and can never be submitted by a
   * client.
   */
  rebuildPassage(
    slug: string,
    input: { mapping: MappingArtifact; actor: Actor; credit?: string[]; ts?: string },
  ): RebuildPassageResult {
    const target = this.getProblemRow(slug);
    if (!target) throw new NotFound(slug);
    const { mapping, actor } = input;

    if (mapping.islandOp !== target.opId) {
      throw new PassageInvalid("mapping_target_mismatch", "mapping.islandOp must match the destination island");
    }
    if (!mapping.sourceIslandOp) {
      throw new PassageInvalid("source_required", "a passage must name its rebuilt departure island");
    }
    if (!mapping.prediction) {
      throw new PassageInvalid("prediction_required", "a passage requires a falsifiable prediction");
    }
    if (!mapping.boundary) {
      throw new PassageInvalid("boundary_required", "a passage requires the important difference or analogy boundary");
    }
    if (mapping.sourceIslandOp === mapping.islandOp) {
      throw new PassageInvalid("same_island", "departure and destination must be different islands");
    }

    const structure = this.getStructure(structSlugOf(mapping.structureId));
    if (!structure || structure.object.id !== mapping.structureId) {
      throw new NotFound(`structure ${mapping.structureId}`);
    }
    const source = this.getProblemRow(slugOf(mapping.sourceIslandOp));
    if (!source || source.opId !== mapping.sourceIslandOp) {
      throw new NotFound(`departure ${mapping.sourceIslandOp}`);
    }

    // The irreducible mapping act is human. A pair is allowed because it
    // contains a ratifying human; a lone agent is never allowed to finalize.
    if (actor.kind === "agent") throw new GatewayDenied("rebuild");
    const sourceRole = this.memberRole(source.opId, actor.id);
    const capActor = { id: actor.id, kind: actor.kind, role: sourceRole };
    if (!can(capActor, "rebuild", this.grantsFor(source.opId, actor.id))) {
      throw new GatewayDenied("rebuild");
    }

    const hasEdge = (opId: string): boolean => this.getEvents(opId).some((event) => {
      if (event.action !== "rebuild" || !event.ref) return false;
      const ref = this.getRef(event.ref);
      if (ref?.kind !== "mapping" || !ref.content || typeof ref.content !== "object") return false;
      return (ref.content as { structureId?: unknown }).structureId === mapping.structureId;
    });
    if (!hasEdge(source.opId)) {
      throw new PassageInvalid(
        "source_unverified",
        "the departure island has no recorded rebuild edge for this structure",
      );
    }
    const passageKind: RebuildPassageResult["passageKind"] = hasEdge(target.opId) ? "charted" : "frontier";

    let result: RebuildPassageResult | undefined;
    const tx = this.db.transaction(() => {
      const ref = this.putRef("mapping", mapping);
      const event = this.appendRaw(target.opId, {
        ts: input.ts ?? new Date().toISOString(),
        op: target.opId as ProblemObject["id"],
        actor,
        credit: input.credit ?? ["credit:human/conceptualization"],
        phase: "B",
        action: "rebuild",
        ref,
      });
      this.addPlacement(target.opId, "dock", ref, {
        action: "rebuild",
        actorId: actor.id,
        structureId: mapping.structureId,
        sourceIslandOp: source.opId,
        passageKind,
        hash: hashEvent(event),
      });
      result = {
        event,
        degraded: false,
        effectiveAction: "rebuild",
        refHash: ref,
        passageKind,
        structureId: mapping.structureId,
        sourceIslandOp: source.opId,
        targetIslandOp: target.opId,
      };
    });
    tx();
    if (!result) throw new ChainError("rebuild passage transaction did not complete");
    return result;
  }

  /**
   * Record a source-preserving cross-island support/refutation. The ledger event
   * points to a response artifact; that artifact retains the target claim ref,
   * body, discriminating test, and evidence descriptor. The entire gateway write
   * is transactional, so a denied/invalid response cannot leave an orphan ref.
   */
  respondToConnection(slug: string, input: ConnectionResponseInput): ConnectionResponseResult {
    const responding = this.getProblemRow(slug);
    if (!responding) throw new NotFound(slug);

    const targetRef = input.targetRef?.trim();
    if (!targetRef) throw new ConnectionResponseInvalid("target_required", "a response requires a target ref");
    const body = input.body?.trim();
    if (!body) throw new ConnectionResponseInvalid("body_required", "a response requires a concrete argument");
    const test = input.test?.trim();
    if (!test) throw new ConnectionResponseInvalid("test_required", "a response requires a discriminating test");
    if (input.language !== undefined && input.language !== "zh" && input.language !== "en") {
      throw new ConnectionResponseInvalid("language_invalid", "language must be zh or en");
    }

    const anchors = this.listProblemRows()
      .flatMap((row) =>
        this.getEvents(row.opId)
          .filter(
            (event) =>
              event.ref === targetRef &&
              (event.action === "submit_claim" || event.action === "publish"),
          )
          .map((event) => ({ row, event })),
      )
      .sort(
        (a, b) =>
          a.event.ts.localeCompare(b.event.ts) ||
          a.row.opId.localeCompare(b.row.opId),
      );
    const anchor = anchors[0];
    if (!anchor || !this.getRef(targetRef)) {
      throw new ConnectionResponseInvalid(
        "target_unanchored",
        "the target ref is not an anchored claim or publication",
      );
    }
    if (anchor.row.opId === responding.opId) {
      throw new ConnectionResponseInvalid("same_island", "a connection response must come from another island");
    }

    const payload = {
      targetRef,
      body,
      test,
      ...(input.language ? { language: input.language } : {}),
      evidence: input.evidence,
    };
    let gatewayResult: GatewayResult | undefined;
    const tx = this.db.transaction(() => {
      gatewayResult = this.gateway(responding.opId, {
        actor: input.actor,
        gatewayAction: input.action,
        phase: "D",
        credit: input.credit ?? ["credit:human/validation"],
        payload,
        refKind: "note",
        station: "workshop",
        placementMeta: {
          targetRef,
          sourceIslandOp: anchor.row.opId,
          responseKind: "connection",
        },
        ts: input.ts,
      });
    });
    tx();
    if (!gatewayResult?.refHash) throw new ChainError("connection response transaction did not complete");
    return {
      ...gatewayResult,
      targetRef,
      responseRef: gatewayResult.refHash,
      sourceIslandOp: anchor.row.opId,
      respondingIslandOp: responding.opId,
    };
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

  /** Cross-island place-plane footprint (depth-plan-v1 §3(d) My Harbor):
   * island SLUGS where the actor holds a membership or a capability grant.
   * `core/harbor.ts` deliberately stays network/DB-free and asks its caller
   * to assemble the footprint — this is that assembly, done where it is one
   * indexed query instead of N `islandDetail` round-trips. */
  actorFootprint(actorId: string): string[] {
    const rows = this.db
      .prepare(
        `SELECT DISTINCT p.slug AS slug FROM problem_objects p
         WHERE p.op_id IN (SELECT op_id FROM memberships WHERE actor_id = ?)
            OR p.op_id IN (SELECT op_id FROM capability_grants WHERE agent_id = ?)
         ORDER BY p.slug`,
      )
      .all(actorId, actorId) as Array<{ slug: string }>;
    return rows.map((r) => r.slug);
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

    // Claims & evidence (§4, Phase B.4): a refute/validate must reference an
    // evidence-role data ref. Judged BEFORE the capability degrade path — an
    // evidence-less refute is rejected outright (record honesty), never parked
    // at the dock as a proposal. Only new writes pass here; appendRaw replay
    // of an existing ledger is untouched (write-side strict, read-side tolerant).
    if ((gatewayAction === "refute" || gatewayAction === "validate") && !hasClaimEvidence(input.payload)) {
      throw new EvidenceRequired(gatewayAction);
    }

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
      this.notifyIfNightDigest(opId, event);
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

    this.notifyIfNightDigest(opId, event);
    return { event, degraded: false, effectiveAction: action, refHash: payloadHash };
  }

  /**
   * Phase B.5: fire-and-forget outbound webhook for `night_digest` ledger
   * events only (§6 interop — "the platform is not an IM"). Both `gateway()`
   * branches funnel through here, right after the ledger write succeeds, so
   * this can never block or fail the write path; a failed push is retried
   * once internally by {@link dispatchNightDigest} and then just warned about.
   * Seed-time history (`seed.ts`) bypasses `gateway()` entirely via
   * `appendRaw`, so replaying/re-seeding never re-fires old digests.
   */
  private notifyIfNightDigest(opId: string, event: LedgerEvent): void {
    if (event.action !== "night_digest") return;
    const slug = slugOf(opId);
    const row = this.getProblemRow(slug);
    const ref = event.ref ? this.getRef(event.ref) : undefined;
    void dispatchNightDigest({
      islandSlug: slug,
      islandName: row?.meta.name ?? row?.object.title ?? slug,
      actorId: event.actor.id,
      refHash: event.ref ?? "",
      ref,
    }).catch((e) => console.warn("[webhook] night digest dispatch threw:", e));
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
      atlas: row.meta.atlas,
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

  /**
   * Dock inbox for the morning-report HITL panel — reduces the ledger via
   * `@frontier-isles/core`'s {@link projectMorningReport} (Phase B.1: drafted
   * from the real ledger, not seeds). `since` is pinned to the epoch rather
   * than the projection's own 24h default: the dock is a standing inbox, not
   * a strict "last night only" view — the seed's 3 drafts date to night
   * 70-72 while "now" anchors near night 86, and a human curator should
   * still see an unresolved draft days later. Only `status: "pending"`
   * entries are returned on the wire: once resolved a draft leaves the inbox
   * (adopted → its destination station; returned → driftwood) — the HITL
   * decision itself stays on the ledger forever, just no longer here.
   */
  morningReport(opId: string) {
    const events = this.getEvents(opId);
    const entries: MorningReportEntry[] = projectMorningReport(events, {
      resolveRef: (ref) => this.getRef(ref),
      since: EPOCH,
    });
    return entries
      .filter((e) => e.status === "pending")
      .map((e) => ({
        refHash: e.eventRef,
        title: e.title,
        dest: e.dest,
        actorId: e.actorId,
        actorKind: e.actorKind,
        credit: e.credit,
        ts: e.ts,
      }));
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

  // --- transplant-through-dock (Phase B.3) ---------------------------------

  /**
   * The driftwood atoms currently available to transplant — real driftwood
   * refs placed in the Garden (not the returned-to-driftwood ghosts, which
   * carry a `ghost` meta). Resolved server-side so the web picker shows the
   * atom text without N ref round-trips; deduped by ref hash.
   */
  listDriftwood(opId: string): Array<{ refHash: string; atom: string; text: string; actorId: string }> {
    const seen = new Set<string>();
    const out: Array<{ refHash: string; atom: string; text: string; actorId: string }> = [];
    for (const pl of this.getPlacements(opId, "driftwood")) {
      if (!pl.refHash || pl.meta.ghost || seen.has(pl.refHash)) continue;
      const ref = this.getRef(pl.refHash);
      if (ref?.kind !== "driftwood") continue;
      const c = (ref.content ?? {}) as { atom?: string; text?: string };
      seen.add(pl.refHash);
      out.push({
        refHash: pl.refHash,
        atom: c.atom ?? "thought",
        text: c.text ?? "",
        actorId: (pl.meta.actorId as string) ?? "",
      });
    }
    return out;
  }

  /**
   * Transplant a driftwood atom through the Ferry Dock into a formal station
   * (architecture.md §4, Phase B.3). "transplant 移栽 always passes the dock,
   * forming one of the four bridge artifacts; 'once driftwood' marks persist."
   *
   * Human-only by construction — the ONLY path into a formal station is a human
   * transplant (§4). We reuse core's `can()` role ladder: `station_write`
   * (researcher+); an apprentice/visitor is denied ({@link GatewayDenied} → 403).
   * A lone agent has no role and no `station_write`, so this path denies it too
   * (and there is deliberately no MCP transplant tool — see mcp.ts).
   *
   * Writes EXACTLY ONE `transplant` event whose `ref` is the freshly-formed
   * `bridge_artifact` (its content carries `onceDriftwood` + the four-type + the
   * dest — never inlined into the event). The place plane then records the
   * pass-through: one placement at the dock, one at the target station.
   */
  transplant(
    slug: string,
    input: {
      driftwoodRef: string;
      type: BridgeArtifactType;
      dest: StationKind;
      body?: string;
      flow?: FlowType;
      actor: Actor;
      credit?: string[];
      ts?: string;
    },
  ): GatewayResult {
    const row = this.getProblemRow(slug);
    if (!row) throw new NotFound(slug);
    const opId = row.opId;

    // Source must be a real driftwood atom.
    const src = this.getRef(input.driftwoodRef);
    if (!src || src.kind !== "driftwood") throw new NotFound(`driftwood ${input.driftwoodRef}`);

    // Capability: human role ladder `station_write` (researcher+); agents never transplant.
    const role = input.actor.kind === "agent" ? undefined : this.memberRole(opId, input.actor.id);
    const capActor = { id: input.actor.id, kind: input.actor.kind, role };
    if (!can(capActor, "transplant", this.grantsFor(opId, input.actor.id))) {
      throw new GatewayDenied("transplant");
    }

    // Pure data shape (throws on a bad type / target — surfaces as a 400 via ZodError-less Error → 500 guard;
    // the web only ever passes valid enums, and the endpoint validates before calling).
    const build = buildTransplant({
      driftwoodRef: input.driftwoodRef,
      type: input.type,
      dest: input.dest,
      body: input.body,
      flow: input.flow,
    });

    const when = input.ts ?? new Date().toISOString();
    const artifactRef = this.putRef("bridge_artifact", build.artifact);
    const event = this.appendRaw(opId, {
      ts: when,
      op: opId as ProblemObject["id"],
      actor: input.actor,
      credit: input.credit ?? ["conceptualization"],
      phase: build.event.phase,
      action: "transplant",
      flow: build.event.flow,
      ref: artifactRef,
    });

    // Place plane (regenerable): the artifact passes THROUGH the dock, then lands
    // at the target formal station. Two placements, still one ledger event.
    this.addPlacement(opId, "dock", artifactRef, {
      action: "transplant",
      actorId: input.actor.id,
      dest: input.dest,
      onceDriftwood: input.driftwoodRef,
      pass: true,
    });
    this.addPlacement(opId, input.dest, artifactRef, {
      action: "transplant",
      actorId: input.actor.id,
      from: "dock",
      onceDriftwood: input.driftwoodRef,
    });

    return { event, degraded: false, effectiveAction: "transplant", refHash: artifactRef };
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

/** Last path segment of a `struct://<org>/<slug>` id. */
export function structSlugOf(structId: string): string {
  const m = /\/([^/]+)$/.exec(structId);
  return m?.[1] ?? structId;
}

function randomToken(): string {
  return randomBytes(32).toString("hex");
}
