import { randomBytes, timingSafeEqual } from "node:crypto";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { ZodError } from "zod";
import type { Actor, FlowType, Phase } from "@frontier-isles/opp";
import type { GatewayAction, StationKind } from "@frontier-isles/core";
import { Store, GatewayDenied, ChainError, NotFound } from "./store.js";
import type { RefKind } from "./refs.js";

const GATEWAY_ACTIONS = new Set<string>([
  "found_island",
  "propose_subquestion",
  "bridge_artifact",
  "submit_claim",
  "refute",
  "validate",
  "transplant",
  "return_to_driftwood",
  "publish",
  "adopt",
  "fork",
  "merge_back",
  "bridge_propose",
  "bridge_accept",
  "grant_capability",
  "night_digest",
  "create_driftwood",
  "attach_data",
  "attach_hardware",
]);

const SESSION_COOKIE = "fi_session";
const OAUTH_STATE_COOKIE = "fi_oauth_state";
const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:5173";

/** Constant-time string compare (OAuth state check). */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function createApp(store: Store): Hono {
  const app = new Hono();

  app.use(
    "/api/*",
    cors({
      origin: WEB_ORIGIN,
      credentials: true,
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type"],
    }),
  );

  const actorOf = (c: import("hono").Context): Actor | undefined =>
    store.sessionActor(getCookie(c, SESSION_COOKIE));

  // --- charts / islands -----------------------------------------------------

  app.get("/api/islands", (c) => c.json({ islands: store.listIslands() }));

  // Sea plane (depth-plan-v2 §3) — a read-only projection over the whole ledger.
  // No new verb; reads are projections (§7-7). Best-effort on the client.
  app.get("/api/currents", (c) => c.json(store.seaData()));

  app.post("/api/islands", async (c) => {
    const body = await c.req.json().catch(() => null);
    if (!body || typeof body !== "object") return c.json({ error: "invalid body" }, 400);
    const actor: Actor | undefined = body.actor ?? actorOf(c);
    if (!actor) return c.json({ error: "actor required" }, 401);
    try {
      const island = store.foundIsland({
        slug: body.slug,
        title: body.title,
        name: body.name ?? actor.id,
        qfocus: body.qfocus,
        domain: body.domain ?? "交叉",
        questions: Array.isArray(body.questions) ? body.questions : [],
        votes: body.votes ?? {},
        ceremonyLog: Array.isArray(body.ceremonyLog) ? body.ceremonyLog : [],
        actor,
        chart: body.chart,
      });
      return c.json({ island }, 201);
    } catch (e) {
      return errorResponse(c, e);
    }
  });

  app.get("/api/islands/:slug", (c) => {
    try {
      return c.json(store.islandDetail(c.req.param("slug")));
    } catch (e) {
      return errorResponse(c, e);
    }
  });

  app.get("/api/islands/:slug/events", (c) => {
    const upToRaw = c.req.query("upTo");
    const upTo = upToRaw !== undefined ? Number(upToRaw) : undefined;
    try {
      return c.json(store.eventStream(c.req.param("slug"), Number.isNaN(upTo) ? undefined : upTo));
    } catch (e) {
      return errorResponse(c, e);
    }
  });

  app.post("/api/islands/:slug/events", async (c) => {
    const slug = c.req.param("slug");
    const row = store.getProblemRow(slug);
    if (!row) return c.json({ error: "not found" }, 404);
    const body = await c.req.json().catch(() => null);
    if (!body || typeof body !== "object") return c.json({ error: "invalid body" }, 400);
    const actor: Actor | undefined = body.actor ?? actorOf(c);
    if (!actor) return c.json({ error: "actor required" }, 401);
    const action = body.action as string;
    if (!GATEWAY_ACTIONS.has(action)) return c.json({ error: `unknown action: ${action}` }, 400);
    try {
      const result = store.gateway(row.opId, {
        actor,
        gatewayAction: action as GatewayAction,
        phase: body.phase as Phase | undefined,
        credit: body.credit,
        flow: body.flow as FlowType | undefined,
        payload: body.payload,
        refKind: body.refKind as RefKind | undefined,
        station: body.station as StationKind | undefined,
        expectPrev: body.prev,
      });
      return c.json(result, 201);
    } catch (e) {
      return errorResponse(c, e);
    }
  });

  app.get("/api/islands/:slug/problem.md", (c) => {
    const row = store.getProblemRow(c.req.param("slug"));
    if (!row) return c.text("not found", 404);
    return c.body(row.md, 200, { "Content-Type": "text/markdown; charset=utf-8" });
  });

  app.get("/api/islands/:slug/ledger.jsonl", (c) => {
    const row = store.getProblemRow(c.req.param("slug"));
    if (!row) return c.text("not found", 404);
    const jsonl = store.getEvents(row.opId).map((e) => JSON.stringify(e)).join("\n");
    return c.body(jsonl ? jsonl + "\n" : "", 200, {
      "Content-Type": "application/x-ndjson; charset=utf-8",
    });
  });

  // --- morning report (dock HITL) ------------------------------------------

  app.get("/api/islands/:slug/morning-report", (c) => {
    const row = store.getProblemRow(c.req.param("slug"));
    if (!row) return c.json({ error: "not found" }, 404);
    return c.json({ drafts: store.morningReport(row.opId) });
  });

  app.post("/api/islands/:slug/morning-report/:refHash", async (c) => {
    const slug = c.req.param("slug");
    const refHashValue = decodeURIComponent(c.req.param("refHash"));
    const body = await c.req.json().catch(() => null);
    if (!body || typeof body !== "object") return c.json({ error: "invalid body" }, 400);
    const actor: Actor | undefined = body.actor ?? actorOf(c);
    if (!actor) return c.json({ error: "actor required" }, 401);
    const decision = body.decision;
    if (decision !== "adopt" && decision !== "return")
      return c.json({ error: "decision must be adopt|return" }, 400);
    try {
      const result = store.resolveMorningReport(slug, refHashValue, decision, actor);
      return c.json(result, 201);
    } catch (e) {
      return errorResponse(c, e);
    }
  });

  // --- auth -----------------------------------------------------------------

  app.post("/api/auth/dev-login", async (c) => {
    if (process.env.NODE_ENV === "production") {
      return c.json({ error: "dev-login disabled" }, 403);
    }
    const body = await c.req.json().catch(() => null);
    const handle = body?.handle;
    if (!handle || typeof handle !== "string") return c.json({ error: "handle required" }, 400);
    const { token, actor } = store.createSession(handle);
    setCookie(c, SESSION_COOKIE, token, { httpOnly: true, sameSite: "Lax", path: "/", secure: WEB_ORIGIN.startsWith("https") });
    return c.json({ actor });
  });

  app.get("/api/me", (c) => {
    const actor = actorOf(c);
    return c.json({ actor: actor ?? null });
  });

  app.post("/api/auth/logout", (c) => {
    store.deleteSession(getCookie(c, SESSION_COOKIE));
    deleteCookie(c, SESSION_COOKIE, { path: "/" });
    return c.json({ ok: true });
  });

  // GitHub OAuth — only wired when env is present (DECISIONS item 6).
  // Standard authorization-code flow with a per-request `state` nonce held in
  // an httpOnly cookie (CSRF binding between /github and /callback).
  app.get("/api/auth/github", (c) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) return c.json({ error: "github oauth not configured" }, 501);
    const state = randomBytes(24).toString("hex");
    setCookie(c, OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "Lax",
      path: "/api/auth",
      maxAge: 600,
      secure: WEB_ORIGIN.startsWith("https"),
    });
    const redirect = `${WEB_ORIGIN}/api/auth/github/callback`;
    const url =
      `https://github.com/login/oauth/authorize?client_id=${clientId}` +
      `&scope=read:user&state=${state}&redirect_uri=${encodeURIComponent(redirect)}`;
    return c.redirect(url);
  });

  app.get("/api/auth/github/callback", async (c) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) return c.json({ error: "github oauth not configured" }, 501);
    const code = c.req.query("code");
    if (!code) return c.json({ error: "missing code" }, 400);
    const state = c.req.query("state") ?? "";
    const expected = getCookie(c, OAUTH_STATE_COOKIE) ?? "";
    deleteCookie(c, OAUTH_STATE_COOKIE, { path: "/api/auth" });
    if (!expected || !safeEqual(state, expected)) return c.json({ error: "state mismatch" }, 400);
    try {
      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
      });
      const tokenJson = (await tokenRes.json()) as { access_token?: string };
      if (!tokenJson.access_token) return c.json({ error: "oauth exchange failed" }, 401);
      const userRes = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${tokenJson.access_token}`, "User-Agent": "frontier-isles" },
      });
      const user = (await userRes.json()) as { login?: string };
      if (!user.login) return c.json({ error: "no login" }, 401);
      const { token } = store.createSession(user.login);
      setCookie(c, SESSION_COOKIE, token, { httpOnly: true, sameSite: "Lax", path: "/", secure: WEB_ORIGIN.startsWith("https") });
      return c.redirect(WEB_ORIGIN);
    } catch {
      return c.json({ error: "oauth error" }, 500);
    }
  });

  app.get("/api/health", (c) => c.json({ ok: true }));

  return app;
}

function errorResponse(c: import("hono").Context, e: unknown) {
  if (e instanceof GatewayDenied) return c.json({ error: e.message, code: "denied" }, 403);
  if (e instanceof ChainError) return c.json({ error: e.message, code: "chain" }, 409);
  if (e instanceof NotFound) return c.json({ error: e.message, code: "not_found" }, 404);
  if (e instanceof ZodError) return c.json({ error: "validation", issues: e.issues }, 400);
  return c.json({ error: (e as Error).message ?? "error" }, 500);
}
