import type { ScreenPoint } from './iso';

export function terrainBoundaryLoops(tiles: Set<string>): Array<Array<[number, number]>> {
  const has = (x: number, y: number): boolean => tiles.has(`${x},${y}`);
  const next = new Map<string, [number, number]>();
  for (const key of tiles) {
    const [x, y] = key.split(',').map(Number) as [number, number];
    if (!has(x, y - 1)) next.set(`${x},${y}`, [x + 1, y]); // top edge
    if (!has(x + 1, y)) next.set(`${x + 1},${y}`, [x + 1, y + 1]); // right edge
    if (!has(x, y + 1)) next.set(`${x + 1},${y + 1}`, [x, y + 1]); // bottom edge
    if (!has(x - 1, y)) next.set(`${x},${y + 1}`, [x, y]); // left edge
  }
  const loops: Array<Array<[number, number]>> = [];
  const used = new Set<string>();
  for (const start of next.keys()) {
    if (used.has(start)) continue;
    const loop: Array<[number, number]> = [];
    let cur = start;
    while (next.has(cur) && !used.has(cur)) {
      used.add(cur);
      const [cx, cy] = cur.split(',').map(Number) as [number, number];
      loop.push([cx, cy]);
      const [ex, ey] = next.get(cur)!;
      cur = `${ex},${ey}`;
    }
    if (loop.length >= 3) loops.push(loop);
  }
  return loops;
}

/**
 * Closed-loop Chaikin corner-cutting, `iters` passes — rounds a jagged tile
 * silhouette into a smooth organic coast/plateau outline.
 */
export function chaikinClosed(pts: ScreenPoint[], iters: number): ScreenPoint[] {
  let p = pts;
  for (let k = 0; k < iters && p.length >= 3; k++) {
    const q: ScreenPoint[] = [];
    for (let i = 0; i < p.length; i++) {
      const a = p[i]!;
      const b = p[(i + 1) % p.length]!;
      q.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 });
      q.push({ x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 });
    }
    p = q;
  }
  return p;
}
