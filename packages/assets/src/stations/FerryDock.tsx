import { NameCard, SelectionHighlight, type StationProps } from '../NameCard';
import { Jetty } from '../scenery/Jetty';
import { Boat } from '../scenery/Boat';

/**
 * 渡口 · Ferry Dock — Bridge layer station; the ferryman 摆渡人 berths here
 * (docs/architecture.md §3/§4).
 *
 * **STUB — no v3 design exists for this station.** Per docs/architecture.md
 * §1 ("Awaiting design v3 … ferry dock station … do not invent visuals"),
 * this reuses the prototype's only dock-adjacent drawing — the L1 jetty
 * (栈桥) + rocking boat that sits at the island's shoreline
 * (`design/handoff/问题群岛-原型 v3.dc.html` lines ~87-93) — as a minimal
 * placeholder. It has no wall/roof/name-card geometry of its own; the
 * `label` NameCard here is synthesized (not in the prototype) purely so
 * this stub matches the other stations' `StationProps` contract.
 *
 * Replace this component wholesale once the real 渡口 art lands; do not
 * build on top of its shape.
 */
export function FerryDock({ x = 0, y = 0, onClick, selected = false, label, showLabel = true }: StationProps) {
  return (
    <g transform={`translate(${x},${y})`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined }}>
      <Jetty />
      <Boat x={836} y={792} variant="jetty" />
      {selected && <SelectionHighlight cx={790} cy={760} />}
      {showLabel && <NameCard x={790} y={706} width={96} text={label?.text ?? '连接工作台'} sealColor={label?.sealColor ?? '#6B6154'} />}
    </g>
  );
}
