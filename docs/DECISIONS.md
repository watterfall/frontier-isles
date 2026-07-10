# Session decisions (build slice 1)

Companion to `architecture.md` v3.0 — records interpretations made while building the first vertical slice. Anything here is subordinate to the architecture doc.

1. **Design v3 arrived.** `architecture.md` §1 names `问题群岛-原型 v2.dc.html` as authority and lists v3 features as "awaiting design". The v3 handoff (`design/handoff/问题群岛-原型 v3.dc.html`) has since been delivered and supersedes v2 for: founding ceremony, multi-presence, AI-resident identity (ink #5A6C9E, dashed stroke, seal glyphs 斥/辩/综/渡), night shift + morning report, driftwood transplant flow. Token sheet is unchanged (v3 artboard 3c states "零 breaking change"); `#5A6C9E` stays a component-level constant, not a token.
2. **Ferry Dock 渡口** has no visual in either prototype → stubbed minimally per §1 ("do not invent visuals"): data-plane station kind `dock` exists in opp/core/server; L1 renders it as a small pier placeholder derived from the prototype's existing 栈桥 (jetty) drawing.
3. **L1 scene rendering:** the prototype is hand-drawn SVG. For pixel-fidelity the L1 scene is data-driven React SVG (`packages/assets` components positioned via `packages/renderer` iso math). The PixiJS 8 engine lives in `packages/renderer` with the full §2 contract + tests, to take over at atlas scale (P3, 700+ islands). This honors "match rendered output; do not port internals". **(Superseded 2026-07 by item 9 for the scene-upgrade campaign: L1 migrates to PixiJS now, not only at atlas scale.)**
4. **DB layer:** better-sqlite3 with plain SQL migrations at boot (drizzle deferred — no schema churn yet; swap-in is mechanical).
5. **Whiteboard co-editing:** minimal Yjs shared-strokes canvas (BlockNote Claim/Evidence blocks deferred to P2).
6. **Auth:** GitHub OAuth when `GITHUB_CLIENT_ID/SECRET` env present; dev bypass issues a demo human actor otherwise.
7. **Just-in-time packages:** workspace packages export TypeScript source directly (`exports: ./src/index.ts`); Vite/tsx/vitest consume TS natively. No build orchestration until publishing matters.
8. **Milestone target of this slice:** P0 complete + P1 skeleton + selected P2 surfaces (driftwood/transplant UI, morning-report HITL UI, MCP server with driftwood-rights gateway) with static/seeded data where the full loop isn't wired yet.
