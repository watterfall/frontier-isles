/**
 * PixiSceneHost — the `?scene=pixi` DEV DEMO wrapper (see main.tsx).
 *
 * A thin full-window host around the controlled {@link PixiScene}: it owns the
 * demo chrome (day↔night slider, undertow toggle, render-metrics HUD) and feeds
 * a mock island + a mock-ledger-derived claim projection. The live L1 uses the
 * SAME {@link PixiScene} component (see GeneratedIslandScreen) fed by real data —
 * this file exists only so the scene can be inspected in isolation.
 */
import { useState } from 'react';
import { projectClaimState, type ClaimState, type StationKind } from '@frontier-isles/core';
import type { ActionType, LedgerEvent } from '@frontier-isles/opp';
import PixiScene, { type PixiSceneMetrics } from './PixiScene';
import type { LayoutInput } from './layout';
import { ClaimDetailPanel } from '../components/island/ClaimDetailPanel';

/**
 * A mock ledger for the demo island, reduced through projectClaimState (M4.3) so
 * the claim buildings' floors/roof/ghost come from events, not a synth: one
 * consensus claim (5 reproductions → roofed), one partially reproduced, one
 * refuted (night ghost), one bare preprint.
 */
const DEMO_CLAIMS: ClaimState[] = (() => {
  const ev: LedgerEvent[] = [];
  let sec = 0;
  const push = (op: string, action: ActionType, ref: string): void => {
    ev.push({ ts: `2026-01-01T00:00:${String(++sec).padStart(2, '0')}.000Z`, op, actor: { id: 'github:demo', kind: 'human' }, credit: [], phase: 'A', action, ref });
  };
  push('op://demo', 'submit_claim', 'sha256:c1');
  for (const o of ['b', 'c', 'd', 'e', 'f']) push(`op://${o}`, 'validate', 'sha256:c1'); // 5 → roofed
  push('op://demo', 'submit_claim', 'sha256:c2');
  push('op://b', 'validate', 'sha256:c2');
  push('op://c', 'validate', 'sha256:c2'); // 2 reproductions
  push('op://demo', 'submit_claim', 'sha256:c3');
  push('op://b', 'refute', 'sha256:c3'); // refuted → ghost
  push('op://demo', 'submit_claim', 'sha256:c4'); // bare preprint
  return projectClaimState(ev);
})();

/**
 * Demo activity for M8 micro-dynamics (chimney smoke / flag wave): `workshop`
 * is genuinely reachable (DEMO_CLAIMS' events all touch it via submit_claim/
 * validate/refute). `data` is forced on for demo visibility — as
 * `core.projectActiveStations`'s own doc explains, the protocol has no
 * dedicated dataset verb yet, so no REAL ledger can produce `data` here; this
 * override exists only so the flag-wave attachment can be eyeballed at all.
 */
const DEMO_ACTIVE: Set<StationKind> = new Set<StationKind>(['workshop', 'data']);

const DEMO: LayoutInput = {
  slug: 'machine-curiosity',
  domain: '数理',
  stage: 2,
  members: 4,
  dormant: false,
  status: 'active',
  outlier: false,
  hasAi: true,
  eventCount: 40,
};

export default function PixiSceneHost({ input = DEMO }: { input?: LayoutInput }) {
  const [t, setT] = useState(0);
  const [undertow, setUndertow] = useState(false);
  const [stat, setStat] = useState<PixiSceneMetrics>({ renderMs: 0, sorted: 0, objects: 0 });
  const [claimPanel, setClaimPanel] = useState<ClaimState | null>(null);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#f2ecd9' }}>
      <PixiScene input={input} claims={DEMO_CLAIMS} t={t} activeStations={DEMO_ACTIVE} substrate={0.7} undertow={undertow} onClaim={setClaimPanel} onMetrics={setStat} />
      <ClaimDetailPanel claim={claimPanel} onClose={() => setClaimPanel(null)} />

      <div style={{ position: 'absolute', top: 12, left: 12, color: '#cfd6e6', font: '12px ui-monospace, monospace', background: 'rgba(0,0,0,.45)', padding: '6px 9px', borderRadius: 6, lineHeight: 1.5, pointerEvents: 'auto' }}>
        <div>M4 · day/night + sea + layered + hit-test</div>
        <div>render {stat.renderMs.toFixed(1)}ms · sorted {stat.sorted} · objects {stat.objects}</div>
        <div>drag = pan · wheel = zoom · tap station</div>
        <button
          type="button"
          onClick={() => setUndertow((v) => !v)}
          style={{ marginTop: 5, font: '11px ui-monospace, monospace', color: '#cfd6e6', background: undertow ? 'rgba(120,60,90,.7)' : 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 5, padding: '3px 7px', cursor: 'pointer' }}
        >
          undertow {undertow ? 'ON' : 'off'}
        </button>
      </div>

      <label style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', color: '#cfd6e6', font: '12px system-ui', background: 'rgba(0,0,0,.45)', padding: '8px 12px', borderRadius: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
        <span>☀︎ day</span>
        <input type="range" min={0} max={1} step={0.01} value={t} onChange={(e) => setT(Number(e.target.value))} style={{ width: 220 }} />
        <span>night ☾ · t={t.toFixed(2)}</span>
      </label>
    </div>
  );
}
