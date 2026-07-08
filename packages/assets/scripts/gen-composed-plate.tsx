/**
 * Generates design-system/21-v2-composed-plate.html — the ONE scene proving the
 * sea-plane axes coexist at near zoom AND the invariant-5 list twin: altitude
 * (IslandMound + shadow) ∘ climate (ClimateField domain hue) ∘ SIGNED currents
 * (projectCurrents → layoutCurrents → Current[], affirm/contest by head shape) ∘
 * sea-depth (seaDepthAt from a real substrate score, absent where unknown) ∘
 * FlowLegend ∘ RelationsList (turn the SVG off, every relation still reads).
 *
 * Run:  pnpm --filter @frontier-isles/assets exec tsx --tsconfig scripts/tsconfig.json scripts/gen-composed-plate.tsx
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { projectCurrents, projectWhirlpools, type Current as LedgerCurrent } from '../../core/src/index';
import { SEA_EVENTS, SEA_ISLANDS } from '../../core/test/fixtures/sea-fixture';
import { domainHueAt, seaDepthAt, layoutCurrents, type Vec2 } from '../../renderer/src/index';
import {
  ClimateField,
  SeaDepth,
  IslandMound,
  Current,
  CurrentDefs,
  FlowLegend,
  RelationsList,
  relationPhrase,
  islandLabel,
  type CurrentKindName,
  type CurrentSignName,
} from '../src/index';
import { NIGHT_SCENE_VARS, sceneVarsToStyle } from '../src/palettes';

const W = 720;
const H = 460;

const currents = projectCurrents(SEA_EVENTS);
const whirlpools = projectWhirlpools(SEA_EVENTS);
const positions = new Map<string, Vec2>(SEA_ISLANDS.map((i) => [i.op, i.pos]));
const paths = layoutCurrents(currents, positions).filter((p) => p.visible);
const islandOf = (op: string) => SEA_ISLANDS.find((s) => s.op === op);

function Scene() {
  return (
    <>
      <CurrentDefs />

      {/* HUE manifold (ClimateField) and VALUE/depth (SeaDepth) are separate
          components — hue and value can never conflate at the type boundary.
          Depth wells appear ONLY for islands with a real substrate score. */}
      <ClimateField width={W} height={H} />
      <SeaDepth
        width={W}
        height={H}
        isobaths
        wells={SEA_ISLANDS.flatMap((isle) => {
          const { overlayAlpha } = seaDepthAt(isle.substrate);
          return overlayAlpha > 0 ? [{ cx: isle.pos[0], cy: isle.pos[1] + 12, r: 60, value: overlayAlpha }] : [];
        })}
      />

      {/* currents draw beneath the islands (sea plane below island containers, §6).
          sign (affirm/contest) chooses the head shape — a refutation cannot render
          as a validation (invariant 8). */}
      {paths.map((p, i) => {
        const cur = p.current as unknown as LedgerCurrent;
        return (
          <Current
            key={`c-${i}`}
            d={p.d}
            kind={cur.kind as CurrentKindName}
            sign={cur.sign as CurrentSignName}
            weight={cur.weight}
            directed={cur.directed}
            maturity={cur.maturity}
          />
        );
      })}

      {/* whirlpool — a vortex sited BETWEEN the two disputing islands */}
      {whirlpools.map((w, i) => {
        const a = islandOf(w.between[0]);
        const b = islandOf(w.between[1]);
        if (!a || !b) return null;
        const cx = (a.pos[0] + b.pos[0]) / 2;
        const cy = (a.pos[1] + b.pos[1]) / 2;
        return (
          <g key={`w-${i}`} fill="none" stroke="var(--fi-gamboge, #E3A93C)" opacity={0.7}>
            <circle cx={cx} cy={cy} r={16} strokeWidth={1.6} strokeDasharray="3 4" />
            <circle cx={cx} cy={cy} r={9} strokeWidth={1.2} strokeDasharray="2 4" />
          </g>
        );
      })}

      {/* islands — altitude (mound + cast shadow). Hue is SAMPLED from the same
          field function as the sea: fill = domainHueAt(coord).fill, so an island's
          hue == its manifold position by construction (no island↔sea drift). */}
      {SEA_ISLANDS.map((isle) => {
        const fill = domainHueAt(isle.vec).fill;
        return (
          <g key={`m-${isle.op}`}>
            <IslandMound variant={isle.variant} fill={fill} x={isle.pos[0]} y={isle.pos[1]} scale={0.62} lifted />
            <text
              x={isle.pos[0]}
              y={isle.pos[1] + 34}
              textAnchor="middle"
              fontSize="10"
              fill="var(--fi-ink-2, #6B6154)"
              style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}
            >
              {isle.name}
            </text>
          </g>
        );
      })}

      <FlowLegend x={W - 214} y={16} />
    </>
  );
}

const dayPanel = renderToStaticMarkup(
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: `${W}px`, borderRadius: '10px' }}>
    <Scene />
  </svg>,
);

const nightPanel = renderToStaticMarkup(
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: `${W}px`, borderRadius: '10px' }}>
    <g style={sceneVarsToStyle(NIGHT_SCENE_VARS)}>
      <Scene />
    </g>
  </svg>,
);

const relationsPanel = renderToStaticMarkup(
  <RelationsList
    currents={currents}
    whirlpools={whirlpools}
    islands={SEA_ISLANDS.map((i) => ({ op: i.op, name: i.name }))}
  />,
);

function short(op: string): string {
  return `…/${islandLabel(op)}`;
}

// Printed proof — affirm ≠ contest must be visible in the derivation.
const derived = currents
  .map((c) => {
    const { verb, glyph } = relationPhrase(c.kind, c.sign);
    const mat = c.maturity ? ` · ${c.maturity}` : '';
    return c.directed
      ? `${short(c.to)} —${verb}${glyph} ${short(c.from)} · ${c.kind} · w${c.weight}${mat}`
      : `${short(c.from)} ⇄ ${short(c.to)} · ${c.kind}${mat} · w${c.weight}`;
  })
  .join('<br>');

const disputes = whirlpools.map((w) => `⊗ ${short(w.between[0])} ↔ ${short(w.between[1])} · disputed · w${w.weight}`).join('<br>');

const html = `<!-- @dsCard group="Patterns · v2 NEW" -->
<!doctype html><meta charset="utf-8"><title>v2 合成板 · 高度∘气候∘洋流∘水深 + 关系孪生 Composed Plate</title>
<style>
:root{
  --fi-paper:#F2EAD8;--fi-paper-raised:#FAF5E8;--fi-ink:#2B2620;--fi-ink-2:#6B6154;
  --fi-azurite:#2E5E8C;--fi-ochre:#B5673A;--fi-malachite:#3E9B7E;--fi-gamboge:#E3A93C;
  --fi-water:#C8D8E4;--fi-night-paper:#161F36;
  --fi-domain-math-fill:#C9D8E6;--fi-domain-matter-fill:#E8CFAE;--fi-domain-life-fill:#C6DECC;--fi-domain-cross-fill:#ECDFB4;
  --fi-font-display:'Noto Serif SC','Songti SC',serif;
  --fi-font-body:'PingFang SC','Hiragino Sans GB','Microsoft YaHei',system-ui,sans-serif;
  --fi-font-mono:'JetBrains Mono',ui-monospace,monospace;
}
*{box-sizing:border-box}html,body{margin:0}
body{font-family:var(--fi-font-body);background:var(--fi-paper);color:var(--fi-ink);padding:24px}
h1{font-family:var(--fi-font-display);font-size:18px;margin:0 0 2px}
.sub{font-size:12px;color:var(--fi-ink-2);margin:0 0 16px;line-height:1.55;max-width:760px}
.tag{display:inline-block;font-family:var(--fi-font-mono);font-size:10px;letter-spacing:.04em;color:var(--fi-ochre);border:1px solid var(--fi-ochre);border-radius:999px;padding:1px 8px;margin-bottom:8px}
.panels{display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start}
.panel{flex:1 1 320px;min-width:280px}
.cap{font-family:var(--fi-font-mono);font-size:10.5px;color:var(--fi-ink-2);margin-top:6px}
.twin{flex:1 1 300px;min-width:260px;background:var(--fi-paper-raised);border-radius:10px;padding:12px 14px}
.twin h2{font-family:var(--fi-font-display);font-size:13px;margin:0 0 8px}
#focuslabel{font-family:var(--fi-font-mono);font-size:10px;color:var(--fi-ochre);margin-bottom:6px;cursor:default}
.derived{font-family:var(--fi-font-mono);font-size:11px;color:var(--fi-ink-2);line-height:1.7;margin-top:14px;padding:12px 14px;background:var(--fi-paper-raised);border-radius:10px}
.derived b{color:var(--fi-ink)}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<body>
<span class="tag">v2 海即数据 · REAL · projectCurrents(ledger) · 有符号 signed · 无硬编码岛 id（不变量 8·15）</span>
<h1>合成板 Composed Plate — 高度 ∘ 气候 ∘ 洋流(有符号) ∘ 水深 + 关系孪生</h1>
<p class="sub">正交轴同屏：<b>高度</b>=IslandMound+投影 · <b>气候</b>=ClimateField 领域色场（色相） · <b>水深</b>=SeaDepth 抽象度暗度（取真实 substrate 分，无分则不画） · <b>洋流</b>=<code>projectCurrents</code> 的有符号关系——<b>支持(→)与争议(⊣)靠箭头形状区分，不靠颜色</b>（异议 ≠ 同意，invariant 8，色盲可辨）。右侧 <b>关系列表</b>是空间层的孪生（invariant 5）：把左边 SVG 关掉，每条关系与漩涡仍读得全。点岛名可聚焦。</p>
<div class="panels">
  <div class="panel">${dayPanel}<div class="cap">昼 day — 默认调色板</div></div>
  <div class="panel">${nightPanel}<div class="cap">夜 night — 仅换调色板（NIGHT_SCENE_VARS），几何不变</div></div>
  <div class="twin"><h2>关系孪生 · list twin</h2><div id="focuslabel">点岛名聚焦（再点取消）</div><div id="relbox">${relationsPanel}</div></div>
</div>
<div class="derived"><b>洋流投影（共享 ref 跨岛推导；affirm ≠ contest，同 azurite 不同箭头）：</b><br>${derived}<br><br><b>漩涡 whirlpool（refute 起浪；他处 validate 不平息 · invariant 8）：</b><br>${disputes || '—'}</div>
<script>
(function(){
  var box=document.getElementById('relbox'); if(!box) return; var focus=null;
  box.addEventListener('click',function(e){
    var b=e.target.closest('[data-op]'); if(!b) return;
    var op=b.getAttribute('data-op'); focus=(focus===op)?null:op;
    box.querySelectorAll('[data-relrow]').forEach(function(row){
      var t=(row.getAttribute('data-touches')||'').split(' ');
      row.style.display=(!focus||t.indexOf(focus)>=0)?'':'none';
    });
    box.querySelectorAll('[data-op]').forEach(function(n){
      n.style.fontWeight=(focus&&n.getAttribute('data-op')===focus)?'700':'';
    });
    var fl=document.getElementById('focuslabel');
    if(fl) fl.textContent=focus?('聚焦 '+op.split('/').pop()+'（再点取消）'):'点岛名聚焦（再点取消）';
  });
})();
</script>
</body>
`;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(__dirname, '../../../design-system/21-v2-composed-plate.html');
writeFileSync(out, html, 'utf-8');
console.log(`wrote ${out} (${html.length} bytes · ${currents.length} currents · ${whirlpools.length} whirlpools)`);
