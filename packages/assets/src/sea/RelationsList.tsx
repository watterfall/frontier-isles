/**
 * 关系列表 RelationsList — the non-spatial twin of the sea plane (invariant 5:
 * every spatial object has a list twin; space is never the only path). Turn the
 * SVG sea OFF and this still conveys every current and whirlpool as a readable
 * row. A row can't lie the way a flowline can — building this twin is what forces
 * the projection to carry the epistemic sign: "affirms" and "contests" are
 * different WORDS, so a refutation can never masquerade as a validation here.
 *
 * It is also the focus reading: `focusedIslandId` filters to one island's
 * relations, and clicking an island name calls `onFocusIsland`. Only existing
 * --fi-* tokens; no spatial dependency.
 */

/** Structural shapes — assignable from core's Current/Whirlpool without a dep edge. */
export interface RelationCurrent {
  from: string;
  to: string;
  kind: string;
  sign: string;
  weight: number;
  directed: boolean;
  maturity?: string;
}
export interface RelationWhirlpool {
  between: [string, string];
  weight: number;
}
export interface RelationIsland {
  op: string;
  name: string;
}

export interface RelationsListProps {
  currents: readonly RelationCurrent[];
  whirlpools: readonly RelationWhirlpool[];
  islands: readonly RelationIsland[];
  /** When set, show only relations touching this op. */
  focusedIslandId?: string;
  /** Clicking an island name calls this with its op. */
  onFocusIsland?: (op: string) => void;
}

/** Short, readable island label — the last `op://…/slug` segment. */
export function islandLabel(op: string): string {
  const seg = op.split('/').pop();
  return seg && seg.length > 0 ? seg : op;
}

/**
 * Pure focus filter — the twin of the spatial current-focus. Returns exactly the
 * currents and whirlpools that touch `focusedIslandId` (all of them when unset).
 * Exported so the reading is unit-testable without a DOM.
 */
export function filterRelations<C extends RelationCurrent, W extends RelationWhirlpool>(
  currents: readonly C[],
  whirlpools: readonly W[],
  focusedIslandId?: string,
): { currents: C[]; whirlpools: W[] } {
  if (!focusedIslandId) return { currents: [...currents], whirlpools: [...whirlpools] };
  return {
    currents: currents.filter((c) => c.from === focusedIslandId || c.to === focusedIslandId),
    whirlpools: whirlpools.filter((w) => w.between[0] === focusedIslandId || w.between[1] === focusedIslandId),
  };
}

/** The verb + head glyph for a current — words carry the sign so text can't lie. */
export function relationPhrase(kind: string, sign: string): { verb: string; glyph: string } {
  if (kind === 'evidence') return sign === 'contest' ? { verb: 'contests', glyph: '⊣' } : { verb: 'affirms', glyph: '→' };
  if (kind === 'lineage') return { verb: 'forks', glyph: '→' };
  return { verb: 'bridges', glyph: '⇄' };
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '6px',
  padding: '3px 4px',
  fontFamily: "'JetBrains Mono',ui-monospace,monospace",
  fontSize: '11.5px',
  lineHeight: 1.5,
  color: 'var(--fi-ink-2, #6B6154)',
  borderBottom: '1px solid var(--fi-water, #C8D8E4)',
};

function IslandName({ op, onFocusIsland }: { op: string; onFocusIsland?: (op: string) => void }) {
  return (
    <button
      type="button"
      data-op={op}
      onClick={onFocusIsland ? () => onFocusIsland(op) : undefined}
      style={{
        font: 'inherit',
        color: 'var(--fi-azurite, #2E5E8C)',
        background: 'none',
        border: 'none',
        borderBottom: '1px dotted var(--fi-azurite, #2E5E8C)',
        padding: 0,
        cursor: 'pointer',
      }}
    >
      {islandLabel(op)}
    </button>
  );
}

export function RelationsList({ currents, whirlpools, islands, focusedIslandId, onFocusIsland }: RelationsListProps) {
  const shown = filterRelations(currents, whirlpools, focusedIslandId);
  const total = shown.currents.length + shown.whirlpools.length;

  return (
    <div
      data-fi="relations-list"
      style={{ fontFamily: "'PingFang SC',sans-serif", color: 'var(--fi-ink, #2B2620)' }}
    >
      <div style={{ fontSize: '11px', color: 'var(--fi-ink-2, #6B6154)', marginBottom: '4px' }}>
        关系 relations · {total}
        {focusedIslandId ? ` · 聚焦 ${islandLabel(focusedIslandId)}` : ''}
        {' '}
        <span style={{ color: 'var(--fi-ink-2, #6B6154)' }}>（海关掉也读得全 · invariant 5）</span>
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {shown.currents.map((c, i) => {
          const { verb, glyph } = relationPhrase(c.kind, c.sign);
          const maturity = c.kind === 'bridge' && c.maturity ? ` · ${c.maturity}` : '';
          return (
            <li key={`c${i}`} data-relrow="current" data-touches={`${c.from} ${c.to}`} style={rowStyle}>
              {c.directed ? (
                <>
                  <IslandName op={c.to} onFocusIsland={onFocusIsland} />
                  <span>—{verb}{glyph}</span>
                  <IslandName op={c.from} onFocusIsland={onFocusIsland} />
                </>
              ) : (
                <>
                  <IslandName op={c.from} onFocusIsland={onFocusIsland} />
                  <span>{glyph}</span>
                  <IslandName op={c.to} onFocusIsland={onFocusIsland} />
                </>
              )}
              <span style={{ color: 'var(--fi-ink-2, #6B6154)' }}>· {c.kind} · w{c.weight}{maturity}</span>
            </li>
          );
        })}
        {shown.whirlpools.map((w, i) => (
          <li key={`w${i}`} data-relrow="whirlpool" data-touches={`${w.between[0]} ${w.between[1]}`} style={rowStyle}>
            <span title="whirlpool" style={{ color: 'var(--fi-gamboge, #E3A93C)' }}>⊗</span>
            <IslandName op={w.between[0]} onFocusIsland={onFocusIsland} />
            <span>↔</span>
            <IslandName op={w.between[1]} onFocusIsland={onFocusIsland} />
            <span style={{ color: 'var(--fi-ink-2, #6B6154)' }}>· disputed · w{w.weight}</span>
          </li>
        ))}
      </ul>
      {islands.length > 0 && total === 0 && (
        <div style={{ fontSize: '11px', color: 'var(--fi-ink-2, #6B6154)', padding: '4px' }}>无关系 · no relations</div>
      )}
    </div>
  );
}
