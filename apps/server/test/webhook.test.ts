import { describe, it, expect, vi } from "vitest";
import {
  buildNightDigestMessage,
  detectProvider,
  dispatchNightDigest,
  formatFeishu,
  formatGeneric,
  formatSlack,
  parseWebhookUrls,
  type FetchLike,
  type NightDigestEventInput,
} from "../src/webhook.js";

/** Typed fetch stub — keeps `.mock.calls[i]` element types concrete instead of `any[]`. */
function fakeFetch(
  impl: (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<{ ok: boolean; status: number }>,
): FetchLike & ReturnType<typeof vi.fn> {
  return vi.fn(impl) as unknown as FetchLike & ReturnType<typeof vi.fn>;
}

const baseInput: NightDigestEventInput = {
  islandSlug: "machine-curiosity",
  islandName: "AI 之问",
  actorId: "did:mcp:scout",
  refHash: "sha256:abcdef0123456789",
  ref: { kind: "note", content: { note: "今晚扫描了 12 篇文献" } },
};

describe("provider detection", () => {
  it("recognizes a Slack incoming-webhook URL", () => {
    expect(detectProvider("https://hooks.slack.com/services/T000/B000/xyz")).toBe("slack");
  });
  it("recognizes a Feishu (飞书) bot webhook URL", () => {
    expect(detectProvider("https://open.feishu.cn/open-apis/bot/v2/hook/xyz")).toBe("feishu");
  });
  it("falls back to generic for anything else (incl. Matrix hookshot)", () => {
    expect(detectProvider("https://matrix.example.org/webhook/abc")).toBe("generic");
    expect(detectProvider("https://example.com/inbound")).toBe("generic");
  });
});

describe("formatters (pure)", () => {
  const msg = buildNightDigestMessage(baseInput);

  it("formatSlack → { text } with island, digest, actor and short ref hash", () => {
    const out = formatSlack(msg);
    expect(out).toHaveProperty("text");
    expect(out.text).toContain("AI 之问");
    expect(out.text).toContain("今晚扫描了 12 篇文献");
    expect(out.text).toContain("did:mcp:scout");
    expect(out.text).toContain("abcdef01"); // short hash, not the full sha256
    expect(out.text).not.toContain("abcdef0123456789");
  });

  it("formatFeishu → { msg_type: 'text', content: { text } }", () => {
    const out = formatFeishu(msg);
    expect(out.msg_type).toBe("text");
    expect(out.content.text).toContain("AI 之问");
    expect(out.content.text).toContain("今晚扫描了 12 篇文献");
  });

  it("formatGeneric → structured JSON, not a flattened string", () => {
    const out = formatGeneric(msg);
    expect(out.kind).toBe("night_digest");
    expect(out.island).toEqual({
      slug: "machine-curiosity",
      name: "AI 之问",
      url: "/islands/machine-curiosity",
    });
    expect(out.text).toBe("今晚扫描了 12 篇文献");
    expect(out.actorId).toBe("did:mcp:scout");
  });

  it("resolves a {title, dest} ref (morning-report draft shape)", () => {
    const m = buildNightDigestMessage({
      ...baseInput,
      ref: { kind: "morning_report", content: { title: "候选文献：主动学习综述", dest: "library" } },
    });
    expect(m.digestText).toContain("候选文献：主动学习综述");
    expect(m.digestText).toContain("library");
  });

  it("falls back to a readable placeholder when there is no ref", () => {
    const m = buildNightDigestMessage({ ...baseInput, ref: undefined });
    expect(m.digestText).toBe("(无摘要)");
  });
});

describe("parseWebhookUrls", () => {
  it("splits + trims a comma-separated list", () => {
    expect(parseWebhookUrls(" https://a.example/x , https://b.example/y ,")).toEqual([
      "https://a.example/x",
      "https://b.example/y",
    ]);
  });
  it("returns [] for undefined/empty (disabled)", () => {
    expect(parseWebhookUrls(undefined)).toEqual([]);
    expect(parseWebhookUrls("")).toEqual([]);
  });
});

describe("dispatchNightDigest — zero real network, injected fetch", () => {
  it("makes zero calls when no URLs are configured", async () => {
    const fetchImpl = vi.fn();
    await dispatchNightDigest(baseInput, { urls: [], fetchImpl });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("posts the provider-correct body to each configured URL", async () => {
    const fetchImpl = fakeFetch(async () => ({ ok: true, status: 200 }));
    await dispatchNightDigest(baseInput, {
      urls: ["https://hooks.slack.com/services/T/B/X", "https://open.feishu.cn/open-apis/bot/v2/hook/Y"],
      fetchImpl,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    const slackBody = JSON.parse(fetchImpl.mock.calls[0]![1].body);
    expect(slackBody).toHaveProperty("text");
    const feishuBody = JSON.parse(fetchImpl.mock.calls[1]![1].body);
    expect(feishuBody.msg_type).toBe("text");
  });

  it("retries once on failure then gives up silently (console.warn, no throw)", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network down");
    });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(
      dispatchNightDigest(baseInput, { urls: ["https://hooks.slack.com/services/x"], fetchImpl }),
    ).resolves.toBeUndefined();
    expect(fetchImpl).toHaveBeenCalledTimes(2); // 1 attempt + 1 retry
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("one URL's failure doesn't stop delivery to the others", async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.includes("dead")) throw new Error("nope");
      return { ok: true, status: 200 };
    });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await dispatchNightDigest(baseInput, {
      urls: ["https://dead.example/x", "https://hooks.slack.com/services/x"],
      fetchImpl,
    });
    // dead URL: 1 + 1 retry = 2 calls; live URL: 1 call = 3 total
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    warn.mockRestore();
  });
});
