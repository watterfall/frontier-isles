import { describe, it, expect, vi } from "vitest";
import { fetchWorks, userAgent } from "../src/crossref.js";
import resp from "./fixtures/crossref-works.json";

describe("userAgent", () => {
  it("carries the package name and optional mailto", () => {
    expect(userAgent()).toContain("frontier-isles-scout/");
    expect(userAgent("you@example.com")).toContain("mailto:you@example.com");
  });
});

describe("fetchWorks (injected fetch, no network)", () => {
  it("parses message.items and passes UA + polite headers", async () => {
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      expect((init?.headers as Record<string, string>)["User-Agent"]).toContain("frontier-isles-scout/");
      return { ok: true, json: async () => resp } as unknown as Response;
    });
    const items = await fetchWorks({
      keywords: ["ai", "curiosity"],
      rows: 5,
      fromPubDate: "2025-07-10",
      mailto: "you@example.com",
      fetchImpl: fetchImpl as unknown as typeof fetch,
      minIntervalMs: 0,
    });
    expect(items).toHaveLength(5);
    expect(items[0]!.DOI).toBe("10.1000/aaa");
    const calledUrl = fetchImpl.mock.calls[0]![0] as string;
    expect(calledUrl).toContain("api.crossref.org/works");
    expect(calledUrl).toContain("mailto=you%40example.com");
  });

  it("retries once with backoff then surfaces a clear error", async () => {
    const sleep = vi.fn(async () => {});
    const fetchImpl = vi.fn(async () => ({ ok: false, status: 503 }) as unknown as Response);
    await expect(
      fetchWorks({
        keywords: ["ai"],
        rows: 1,
        fromPubDate: "2025-01-01",
        fetchImpl: fetchImpl as unknown as typeof fetch,
        minIntervalMs: 0,
        sleep,
      }),
    ).rejects.toThrow(/CrossRef fetch failed after retry/);
    expect(fetchImpl).toHaveBeenCalledTimes(2); // initial + one retry
    expect(sleep).toHaveBeenCalled(); // backoff happened
  });
});
