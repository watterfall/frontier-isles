import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { openDb } from "../src/db.js";
import { Store } from "../src/store.js";
import { createApp } from "../src/app.js";
import { seed } from "../src/seed.js";
import type { Hono } from "hono";
import type { FetchLike } from "../src/webhook.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jsonOf = async (res: { json(): Promise<unknown> }): Promise<any> => res.json();

/**
 * Phase B.5 — the night-digest webhook trigger path, end to end through the
 * real HTTP gateway (`POST /api/islands/:slug/events` → `Store.gateway` →
 * `notifyIfNightDigest` → `dispatchNightDigest`). No real network: `global.fetch`
 * is replaced with a `vi.fn()` for the whole file.
 */

let store: Store;
let app: Hono;
let fetchMock: ReturnType<typeof vi.fn>;

const ORIGINAL_ENV = process.env.NIGHT_DIGEST_WEBHOOKS;
const ORIGINAL_FETCH = globalThis.fetch;
const WEBHOOK_URL = "https://hooks.slack.com/services/T000/B000/fake";

const MASTER = { id: "github:shen-kuo", kind: "human" as const };
const AGENT = { id: "github:test-scout", kind: "agent" as const };

beforeEach(() => {
  store = new Store(openDb(":memory:"));
  seed(store);
  app = createApp(store);
  const impl: FetchLike = async () => ({ ok: true, status: 200 });
  fetchMock = vi.fn(impl);
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
  if (ORIGINAL_ENV === undefined) delete process.env.NIGHT_DIGEST_WEBHOOKS;
  else process.env.NIGHT_DIGEST_WEBHOOKS = ORIGINAL_ENV;
  vi.restoreAllMocks();
});

const post = (path: string, body: unknown) =>
  app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const settle = () => new Promise((r) => setTimeout(r, 20));

describe("night-digest webhook — trigger path", () => {
  it("fires once for a real night_digest event when a webhook is configured", async () => {
    process.env.NIGHT_DIGEST_WEBHOOKS = WEBHOOK_URL;
    const res = await post("/api/islands/machine-curiosity/events", {
      actor: AGENT,
      action: "night_digest",
      payload: { note: "今晚扫描了 12 篇文献" },
    });
    expect(res.status).toBe(201);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(WEBHOOK_URL);
    const body = JSON.parse((init as { body: string }).body);
    expect(body.text).toContain("今晚扫描了 12 篇文献");
  });

  it("also fires for a degraded push (dock_proposal is still a night_digest ledger event)", async () => {
    process.env.NIGHT_DIGEST_WEBHOOKS = WEBHOOK_URL;
    const res = await post("/api/islands/machine-curiosity/events", {
      actor: AGENT,
      action: "submit_claim",
      payload: { body: "ungranted agent claim → degrades to dock proposal" },
    });
    expect(res.status).toBe(201);
    const body = await jsonOf(res);
    expect(body.effectiveAction).toBe("dock_proposal");
    expect(body.event.action).toBe("night_digest");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  });

  it("does NOT fire for a non-night_digest action (authorized, non-degraded)", async () => {
    process.env.NIGHT_DIGEST_WEBHOOKS = WEBHOOK_URL;
    await post("/api/islands/machine-curiosity/events", {
      actor: MASTER,
      action: "grant_capability",
      payload: { agent: AGENT.id, capability: "station_write" },
    });
    fetchMock.mockClear();

    const res = await post("/api/islands/machine-curiosity/events", {
      actor: AGENT,
      action: "submit_claim",
      payload: { body: "authorized claim, not a digest — must stay silent" },
    });
    expect(res.status).toBe(201);
    const body = await jsonOf(res);
    expect(body.effectiveAction).toBe("submit_claim");
    await settle();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("makes zero network calls when NIGHT_DIGEST_WEBHOOKS is unset (default, silent)", async () => {
    delete process.env.NIGHT_DIGEST_WEBHOOKS;
    const res = await post("/api/islands/machine-curiosity/events", {
      actor: AGENT,
      action: "night_digest",
      payload: { note: "无人监听的夜晚" },
    });
    expect(res.status).toBe(201);
    await settle();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("a rejecting fetch never affects the ledger write's response", async () => {
    process.env.NIGHT_DIGEST_WEBHOOKS = WEBHOOK_URL;
    fetchMock.mockRejectedValue(new Error("network down"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const res = await post("/api/islands/machine-curiosity/events", {
      actor: AGENT,
      action: "night_digest",
      payload: { note: "网络挂了也要写账本" },
    });
    expect(res.status).toBe(201);
    const body = await jsonOf(res);
    expect(body.event.action).toBe("night_digest");
    expect(store.verify("op://frontier-isles/prob/machine-curiosity").ok).toBe(true);

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2)); // 1 attempt + 1 retry
    expect(warn).toHaveBeenCalled();
  });
});
