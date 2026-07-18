/**
 * Static structure-lens fallback (执行纲要 §九) — sibling to `seaFallback.ts`.
 * When the server API is unreachable the structure lens renders IDENTICALLY
 * from this module: the same `SEED_STRUCTURES` the server seeds as real
 * rebuild events, reduced through the same `structureFrontier` projection the
 * server's `/api/structures/graph` uses. Offline is not a degraded mode — it
 * is the same reduce over the same source of truth (CLAUDE.md offline rule).
 *
 * No edge is invented here (inv 14/15): every fallback edge corresponds 1:1 to
 * a mapping the server materialises as a `rebuild` ledger event (curator
 * shen-kuo, `seedStructures`). If the two ever disagree, the seed changed and
 * this file's test will catch the drift.
 */
import { structureFrontier, type StructureEdge } from '@frontier-isles/core';
import { SEED_STRUCTURES } from '@frontier-isles/data/structures';
import { DATA } from './fallback';
import type { ApiStructure, ApiStructureGraph } from './client';

/** Mirrors the server's `opIdFor` (store.ts): `op://frontier-isles/prob/<slug>`. */
export const opIdFor = (slug: string): string => `op://frontier-isles/prob/${slug}`;
export const slugOfOp = (op: string): string => op.split('/').at(-1) ?? op;

/** The seed curator — the server materialises each mapping as ONE rebuild
 * event by this actor, so fallback edges carry the same weight/actors. */
const SEED_CURATOR = 'github:shen-kuo';

export function fallbackStructures(): ApiStructure[] {
  return SEED_STRUCTURES.map((s) => ({
    schema: 'opp/0.3',
    id: s.id,
    title: s.title,
    statement: s.statement,
    status: s.status,
    theme: s.theme,
    isomorphism: s.isomorphism,
    provenance: s.provenance,
    license: 'CC-BY-4.0',
  }));
}

export function fallbackStructureGraph(): ApiStructureGraph {
  const edges: StructureEdge[] = SEED_STRUCTURES.flatMap((s) =>
    s.mappings.map((m) => ({
      structureId: s.id,
      islandOp: opIdFor(m.slug),
      weight: 1,
      actors: [SEED_CURATOR],
    })),
  ).sort((a, b) =>
    a.structureId < b.structureId ? -1 : a.structureId > b.structureId ? 1 : a.islandOp < b.islandOp ? -1 : 1,
  );
  // Same island shape the server feeds structureFrontier (op/domain/cluster).
  const islands = DATA.filter((d) => d.slug).map((d) => ({
    op: opIdFor(d.slug!),
    domain: d.d,
    cluster: d.cluster?.code,
  }));
  const mappings = SEED_STRUCTURES.flatMap((structure) => structure.mappings.map((mapping, index) => ({
    refHash: `seed:${structure.id}:${mapping.slug}:${index}`,
    actor: SEED_CURATOR,
    ts: '2026-07-18T00:00:00.000Z',
    structureId: structure.id,
    islandOp: opIdFor(mapping.slug),
    correspondences: mapping.correspondences,
    ...(mapping.prediction ? { prediction: mapping.prediction } : {}),
    ...(mapping.boundary ? { boundary: mapping.boundary } : {}),
  })));
  return { edges, frontier: structureFrontier(edges, islands), mappings };
}
