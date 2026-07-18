import type { LedgerEvent } from "@frontier-isles/opp";
import type { MappingArtifact } from "./mapping";

/**
 * Projections over the ledger into the 结构 ⇄ 现象 bipartite graph (执行纲要 §九).
 * Everything here is a `reduce` over real `rebuild` events — no edge exists
 * without an event (inv 14/15), and no function draws a link on its own. All are
 * deterministic + order-independent (inv 13): the same events yield the same graph.
 */

export interface StructureEdge {
  structureId: string;
  islandOp: string;
  /** number of rebuild events backing this structure⇄island edge. */
  weight: number;
  actors: string[];
}

/** One explanatory mapping record behind the compressed structure edge. The
 * graph edge stays the geometry/provenance reduce; this record is the read
 * projection that lets a client explain WHY a structure was rebuilt here. */
export interface StructureMappingRecord extends MappingArtifact {
  refHash: string;
  actor: string;
  ts: string;
}

/** Resolve every real rebuild event into its human-authored mapping content.
 * Unlike `reduceStructureGraph`, repeated refinements are intentionally kept:
 * a reader may inspect how a correspondence and its boundary evolved. */
export function projectStructureMappings(
  events: readonly LedgerEvent[],
  resolveRef: (ref: string) => MappingArtifact | null,
): StructureMappingRecord[] {
  const records: StructureMappingRecord[] = [];
  for (const event of events) {
    if (event.action !== "rebuild" || !event.ref) continue;
    const mapping = resolveRef(event.ref);
    if (!mapping) continue;
    records.push({
      ...mapping,
      refHash: event.ref,
      actor: event.actor.id,
      ts: event.ts,
    });
  }
  return records.sort((a, b) =>
    a.structureId < b.structureId
      ? -1
      : a.structureId > b.structureId
        ? 1
        : a.islandOp < b.islandOp
          ? -1
          : a.islandOp > b.islandOp
            ? 1
            : a.ts < b.ts
              ? -1
              : a.ts > b.ts
                ? 1
                : a.refHash < b.refHash
                  ? -1
                  : a.refHash > b.refHash
                    ? 1
                    : 0,
  );
}

/**
 * Reduce the ledger into structure⇄island edges. An edge appears ONLY where a
 * `rebuild` event carries a resolvable mapping artifact — a "draw a link" tool
 * does not exist (inv 15). Repeat rebuilds of the same pair accumulate weight
 * and distinct actors.
 */
export function reduceStructureGraph(
  events: readonly LedgerEvent[],
  resolveRef: (ref: string) => MappingArtifact | null,
): StructureEdge[] {
  const byKey = new Map<string, StructureEdge>();
  for (const e of events) {
    if (e.action !== "rebuild" || !e.ref) continue;
    const m = resolveRef(e.ref);
    if (!m) continue;
    const key = `${m.structureId} ${m.islandOp}`;
    const edge = byKey.get(key);
    if (edge) {
      edge.weight += 1;
      if (!edge.actors.includes(e.actor.id)) edge.actors.push(e.actor.id);
    } else {
      byKey.set(key, {
        structureId: m.structureId,
        islandOp: m.islandOp,
        weight: 1,
        actors: [e.actor.id],
      });
    }
  }
  return [...byKey.values()].sort((a, b) =>
    a.structureId < b.structureId
      ? -1
      : a.structureId > b.structureId
        ? 1
        : a.islandOp < b.islandOp
          ? -1
          : a.islandOp > b.islandOp
            ? 1
            : 0,
  );
}

export interface StructureIslandLike {
  op: string;
  domain: string;
  cluster?: string;
}

export interface StructureFrontier {
  structureId: string;
  /** Islands where this structure has been rebuilt — solid, lit on the lens. */
  rebuilt: string[];
  /** The visible frontier: same-cluster/domain islands where NO ONE has yet
   *  brought this structure — the map's honest dashed gaps (执行纲要 §九). The
   *  full gap set (every other island) lives in the list twin, not the map. */
  gaps: string[];
}

/**
 * Per structure: which islands have rebuilt it, and the near gaps (same cluster
 * or same domain, not yet rebuilt). The gap set is deliberately narrowed to the
 * neighbourhood so the map shows a legible frontier, not global dashed noise.
 */
export function structureFrontier(
  edges: readonly StructureEdge[],
  islands: readonly StructureIslandLike[],
): StructureFrontier[] {
  const byStruct = new Map<string, Set<string>>();
  for (const e of edges) {
    const set = byStruct.get(e.structureId) ?? byStruct.set(e.structureId, new Set()).get(e.structureId)!;
    set.add(e.islandOp);
  }
  const islandBy = new Map(islands.map((i) => [i.op, i]));
  const out: StructureFrontier[] = [];
  for (const [structureId, rebuiltSet] of [...byStruct].sort()) {
    const rebuilt = [...rebuiltSet].sort();
    const nearClusters = new Set<string>();
    const nearDomains = new Set<string>();
    for (const op of rebuilt) {
      const isl = islandBy.get(op);
      if (isl?.cluster) nearClusters.add(isl.cluster);
      if (isl?.domain) nearDomains.add(isl.domain);
    }
    const gaps = islands
      .filter(
        (i) =>
          !rebuiltSet.has(i.op) &&
          ((i.cluster !== undefined && nearClusters.has(i.cluster)) || nearDomains.has(i.domain)),
      )
      .map((i) => i.op)
      .sort();
    out.push({ structureId, rebuilt, gaps });
  }
  return out;
}

export interface DomainPairDistance {
  a: string;
  b: string;
  sharedStructures: number;
}

/**
 * Domain×domain structure-overlap density: how many structures span each pair
 * of domains. PRODUCE-ONLY this phase — it does NOT drive layout. It reserves
 * the interface for the invariant-16 continuous-domain-coordinate rework (see
 * memory domain-partition-rework): distance measured by shared structure, not
 * declared by a taxonomy.
 */
export function disciplineDistance(
  edges: readonly StructureEdge[],
  islands: readonly StructureIslandLike[],
): DomainPairDistance[] {
  const domainOf = new Map(islands.map((i) => [i.op, i.domain]));
  const structDomains = new Map<string, Set<string>>();
  for (const e of edges) {
    const d = domainOf.get(e.islandOp);
    if (!d) continue;
    const set = structDomains.get(e.structureId) ?? structDomains.set(e.structureId, new Set()).get(e.structureId)!;
    set.add(d);
  }
  const pairCount = new Map<string, number>();
  for (const doms of structDomains.values()) {
    const list = [...doms].sort();
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const key = `${list[i]} ${list[j]}`;
        pairCount.set(key, (pairCount.get(key) ?? 0) + 1);
      }
    }
  }
  return [...pairCount]
    .sort()
    .map(([key, n]) => {
      const [a, b] = key.split(" ") as [string, string];
      return { a, b, sharedStructures: n };
    });
}
