import { useEffect, useState } from 'react';
import { collisionKey, type ExplorationCatalog, type QuestionCollision } from '@frontier-isles/data/xfrontier-exploration';
import { questionCoast, questionLabel } from '../../data/collisionThemes';
import type { ExplorationMove } from '@frontier-isles/data/exploration-assistant';

const POSITIONS = [[145, 100], [450, 85], [755, 105], [300, 250], [640, 245], [130, 390], [450, 390], [770, 385], [85, 250], [825, 250]];

export function CollisionVoyageMap({ catalog, ids, selected, travelled, lang, onSelect, onQuestion, proposals = [], onProposal }: {
  catalog: ExplorationCatalog; ids: readonly string[]; selected: QuestionCollision; travelled: string[]; lang: 'zh' | 'en';
  onSelect: (pair: QuestionCollision) => void; onQuestion: (id: string) => void;
  proposals?: ExplorationMove[]; onProposal?: (move: ExplorationMove) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 800px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 800px)');
    const update = () => setCompact(query.matches); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const nodes = ids.filter((id) => catalog.questions.some((q) => q.id === id)).slice(0, 10).map((id, i) => ({ id, x: compact ? (i % 2 ? 290 : 96) : POSITIONS[i]![0]!, y: compact ? 70 + Math.floor(i / 2) * 130 : POSITIONS[i]![1]! }));
  const edges = catalog.collisions.filter((pair) => nodes.some((n) => n.id === pair.a) && nodes.some((n) => n.id === pair.b));
  const zh = lang === 'zh';
  return <div className="fi-voyage-map">
    <svg viewBox={compact ? `0 0 390 ${Math.ceil(nodes.length / 2) * 130 + 35}` : '0 0 920 475'} role="group" aria-label={zh ? '跨领域问题群岛，可选择岛屿和碰撞航线' : 'Interdisciplinary question islands; choose islands and collision routes'}>
      <g className="fi-voyage-isobars" aria-hidden="true">
        <path d="M-40 200C80 110 125 210 240 140S460 5 600 68S800 175 960 105M-40 222C80 130 120 230 242 161S460 27 600 90S800 197 960 127M-40 244C80 152 120 252 242 183S460 49 600 112S800 219 960 149" />
        <path d="M-20 445C130 295 180 470 350 350S575 355 680 325S840 300 970 415M-20 465C130 315 180 490 350 370S575 375 680 345S840 320 970 435" />
      </g>
      {edges.map((pair) => {
        const a = nodes.find((n) => n.id === pair.a)!, b = nodes.find((n) => n.id === pair.b)!;
        const key = collisionKey(pair), current = key === collisionKey(selected), walked = travelled.includes(key);
        const bend = (b.x - a.x) * 0.16;
        const path = `M${a.x} ${a.y} Q${(a.x + b.x) / 2} ${(a.y + b.y) / 2 - bend} ${b.x} ${b.y}`;
        return <g key={key} className="fi-voyage-edge" data-route-key={key} data-current={current} data-travelled={walked} data-muted={!!hovered && pair.a !== hovered && pair.b !== hovered} role="button" tabIndex={0}
          aria-label={`${zh ? '比较' : 'Compare'} ${questionLabel(catalog, pair.a, lang)} / ${questionLabel(catalog, pair.b, lang)}`} aria-pressed={current}
          onClick={() => onSelect(pair)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(pair); } }}>
          <path className="fi-voyage-edge-hit" d={path} /><path className="fi-voyage-edge-line" d={path} />
          {current && <circle className="fi-voyage-bearing" cx={(a.x + b.x) / 2} cy={(a.y + b.y) / 2 - bend / 2} r="5" />}
        </g>;
      })}
      {proposals.filter((move) => move.kind === 'bridge' && move.questionIds.length > 1).flatMap((move, index) => {
        const a = nodes.find((n) => n.id === move.questionIds[0]);
        return move.questionIds.slice(1).map((id) => {
          const b = nodes.find((n) => n.id === id);
          if (!a || !b) return null;
          return <g key={`proposal-${index}-${id}`} role="button" tabIndex={0} aria-label={`${zh ? 'AI 提案，未验证' : 'AI proposal, untested'}: ${move.title}`} onClick={() => onProposal?.(move)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onProposal?.(move); } }}>
            <path className="fi-voyage-edge-hit" d={`M${a.x} ${a.y}Q${(a.x + b.x) / 2 + 35} ${(a.y + b.y) / 2 - 55} ${b.x} ${b.y}`} />
            <path className="fi-voyage-proposal" d={`M${a.x} ${a.y}Q${(a.x + b.x) / 2 + 35} ${(a.y + b.y) / 2 - 55} ${b.x} ${b.y}`} />
          </g>;
        });
      })}
      {nodes.map(({ id, x, y }, index) => {
        const selectedNode = id === selected.a || id === selected.b;
        const q = catalog.questions.find((q) => q.id === id)!;
        return <g key={id} transform={`translate(${x} ${y})`} className="fi-voyage-island" data-question-id={id} data-selected={selectedNode} data-side={id === selected.b ? 'b' : 'a'} role="button" tabIndex={0}
          aria-label={lang === 'zh' ? q.q : q.q_en} aria-pressed={selectedNode}
          onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(id)} onBlur={() => setHovered(null)}
          onClick={() => onQuestion(id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onQuestion(id); } }}>
          <title>{lang === 'zh' ? q.q : q.q_en}</title>
          <path className="fi-voyage-shore" d={questionCoast(id, 1.18)} />
          <path className="fi-voyage-land" d={questionCoast(id)} />
          {[0.78, 0.55, 0.32].map((scale) => <path key={scale} className="fi-voyage-contour" d={questionCoast(id, scale)} transform={`translate(${(1 - scale) * ((index % 3) - 1) * 10} ${-(1 - scale) * 7})`} />)}
          <circle className="fi-voyage-observation" r="3" cy="-5" />
          <text className="fi-voyage-island-name" textAnchor="middle" y="64">{questionLabel(catalog, id, lang)}</text>
        </g>;
      })}
    </svg>
    <div className="fi-voyage-legend"><span><i />{zh ? '编辑提出的联系' : 'Editorial connection'}</span><span><i className="fi-voyage-personal-line" />{zh ? '我留下思考的航线' : 'A route with my notes'}</span>{proposals.some((m) => m.kind === 'bridge') && <span><i className="fi-voyage-proposal-line" />{zh ? 'AI 提案 · 未验证' : 'AI proposal · untested'}</span>}</div>
    <p className="fi-voyage-map-note">{zh ? '地形用于辨认问题；距离不代表相似度，连线不代表机制已成立。' : 'Terrain identifies questions. Distance is not similarity; a connection is not a proven mechanism.'}</p>
  </div>;
}
