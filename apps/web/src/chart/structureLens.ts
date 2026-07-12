/**
 * Structure lens geometry (执行纲要 §九) — a PURE reduce from the bipartite graph
 * to draw instructions, no WebGL. When a structure is selected the atlas enters a
 * modal lens: islands where it was rebuilt light up solid (with arcs between
 * them), the near gaps show as honest dashed haloes ("此结构尚无人带来" — the
 * visible frontier), and everything else dims.
 *
 * §九 red-line: a gap node carries ONLY its position + op — NEVER any mapping
 * data. The dashed marker states the fact "no edge here"; it never suggests a
 * mapping (that would be the AI pre-laying the edge the human must author).
 */

export interface LensIslandLike {
  op: string;
  x: number;
  y: number;
  domain: string;
  cluster?: string;
}

export interface LensEdgeLike {
  structureId: string;
  islandOp: string;
}

export interface LensFrontierLike {
  structureId: string;
  rebuilt: string[];
  gaps: string[];
}

/** A lit island: it has been rebuilt for the selected structure. */
export interface LensRebuiltNode {
  op: string;
  x: number;
  y: number;
}

/** A gap island: the structure has NOT been brought here yet. Deliberately
 *  carries no mapping/correspondence data — only where the island sits. */
export interface LensGapNode {
  op: string;
  x: number;
  y: number;
}

/** An arc between two rebuilt islands (reuses the air-route/bridge arc vocabulary). */
export interface LensArc {
  fromOp: string;
  toOp: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface StructureLens {
  structureId: string;
  rebuilt: LensRebuiltNode[];
  gaps: LensGapNode[];
  /** Ops of every island that is neither rebuilt nor a near gap — dimmed. */
  dimmed: string[];
  /** Arcs connecting the rebuilt islands (chord order, deterministic). */
  arcs: LensArc[];
}

/**
 * Build the lens for one structure. Deterministic and order-independent: the
 * output depends only on the graph + island set, never on iteration order.
 */
export function buildStructureLens(
  structureId: string,
  _edges: readonly LensEdgeLike[],
  frontier: readonly LensFrontierLike[],
  islands: readonly LensIslandLike[],
): StructureLens {
  const f = frontier.find((x) => x.structureId === structureId);
  const rebuiltSet = new Set(f?.rebuilt ?? []);
  const gapSet = new Set(f?.gaps ?? []);
  const byOp = new Map(islands.map((i) => [i.op, i]));

  const rebuilt: LensRebuiltNode[] = [];
  const gaps: LensGapNode[] = [];
  const dimmed: string[] = [];
  for (const i of islands) {
    if (rebuiltSet.has(i.op)) rebuilt.push({ op: i.op, x: i.x, y: i.y });
    else if (gapSet.has(i.op)) gaps.push({ op: i.op, x: i.x, y: i.y }); // NO mapping data (§九)
    else dimmed.push(i.op);
  }
  rebuilt.sort((a, b) => (a.op < b.op ? -1 : a.op > b.op ? 1 : 0));
  gaps.sort((a, b) => (a.op < b.op ? -1 : a.op > b.op ? 1 : 0));
  dimmed.sort();

  // Arcs: connect each rebuilt island to the next (a simple chord chain in
  // sorted order — same span vocabulary as air routes, no new geometry).
  const arcs: LensArc[] = [];
  for (let k = 0; k + 1 < rebuilt.length; k++) {
    const a = rebuilt[k]!;
    const b = rebuilt[k + 1]!;
    if (!byOp.has(a.op) || !byOp.has(b.op)) continue;
    arcs.push({ fromOp: a.op, toOp: b.op, x1: a.x, y1: a.y, x2: b.x, y2: b.y });
  }

  return { structureId, rebuilt, gaps, dimmed, arcs };
}

/** The stage-facing lens shape (slug space — the stage owns positions). */
export interface AtlasLensSlugs {
  structureId: string;
  rebuiltSlugs: string[];
  /** Near gaps: same cluster as a rebuilt island (full dash). */
  gapSlugs: string[];
  /** Far gaps: same domain, different cluster (fainter dash, lighter dim). */
  farGapSlugs: string[];
  arcs: Array<{ fromSlug: string; toSlug: string }>;
}

const slugOfOp = (op: string): string => op.split('/').at(-1) ?? op;

/**
 * Adapt the op-keyed graph to the slug-keyed stage input: build the lens over
 * the islands ACTUALLY on stage (the despaced atlas scene), then hand the
 * stage bare slugs — it projects positions itself, so the lens marks always
 * sit exactly where the engine drew each island.
 *
 * `clusterBySlug` (optional) splits the frontier's gaps into a near/far
 * gradient: a gap in the SAME CLUSTER as a rebuilt island is near (full
 * dash), the rest — same domain only — are far (fainter). No cluster
 * knowledge → every gap is near, the flat v1 reading.
 */
export function toAtlasLens(
  structureId: string,
  edges: readonly LensEdgeLike[],
  frontier: readonly LensFrontierLike[],
  stageIslands: ReadonlyArray<{ slug: string; x: number; y: number; domain: string }>,
  clusterBySlug?: ReadonlyMap<string, string | undefined>,
): AtlasLensSlugs {
  const islands: LensIslandLike[] = stageIslands.map((i) => ({
    op: `op://frontier-isles/prob/${i.slug}`,
    x: i.x,
    y: i.y,
    domain: i.domain,
  }));
  const lens = buildStructureLens(structureId, edges, frontier, islands);
  const rebuiltSlugs = lens.rebuilt.map((n) => slugOfOp(n.op));
  const rebuiltClusters = new Set(
    rebuiltSlugs.map((slug) => clusterBySlug?.get(slug)).filter((c): c is string => !!c),
  );
  const gapSlugs: string[] = [];
  const farGapSlugs: string[] = [];
  for (const n of lens.gaps) {
    const slug = slugOfOp(n.op);
    const cluster = clusterBySlug?.get(slug);
    if (!clusterBySlug || (cluster && rebuiltClusters.has(cluster))) gapSlugs.push(slug);
    else farGapSlugs.push(slug);
  }
  return {
    structureId,
    rebuiltSlugs,
    gapSlugs,
    farGapSlugs,
    arcs: lens.arcs.map((a) => ({ fromSlug: slugOfOp(a.fromOp), toSlug: slugOfOp(a.toOp) })),
  };
}
