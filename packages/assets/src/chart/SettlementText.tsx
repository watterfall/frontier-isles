/**
 * 聚落底纹大字 — the four faint oversized domain-sea names watermarked
 * behind the L0 chart. Extracted verbatim from design/handoff/问题群岛-原型
 * v3.dc.html lines ~614-619.
 */
export function SettlementText() {
  return (
    <g style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 900 }} fill="rgba(74,66,56,0.065)">
      <text x="210" y="510" fontSize="54" letterSpacing="8">数理之海</text>
      <text x="1040" y="530" fontSize="54" letterSpacing="8">物质之洲</text>
      <text x="560" y="208" fontSize="46" letterSpacing="8">生命之屿</text>
      <text x="600" y="676" fontSize="54" letterSpacing="8">交叉之湾</text>
    </g>
  );
}
