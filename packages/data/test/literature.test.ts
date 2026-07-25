import { describe, it, expect } from "vitest";
import { FRONTIERS } from "../src/frontiers";
import { LITERATURE_SLUGS, literatureBySlug } from "../src/literature";

/**
 * `literature.ts` is generated from the xfrontier evidence set, so the risk it
 * carries is not bad prose — it is a citation nobody can check. These gate that:
 * every reference is real and linkable, points at an island that exists, and
 * never silently restates the headline citation the island already shows.
 */
describe("island literature", () => {
  const bySlug = new Map(FRONTIERS.map((f) => [f.slug, f]));
  const norm = (u: string) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "").toLowerCase();

  it("only references islands that exist", () => {
    for (const slug of LITERATURE_SLUGS) expect(bySlug.has(slug), slug).toBe(true);
  });

  it("covers most of the corpus — an empty shelf on every island would be the bug this file fixes", () => {
    expect(LITERATURE_SLUGS.length).toBeGreaterThan(FRONTIERS.length * 0.8);
  });

  it("every reference is checkable: title, venue, a plausible year, and an http(s) link", () => {
    for (const slug of LITERATURE_SLUGS) {
      for (const ref of literatureBySlug(slug)) {
        expect(ref.title.length, slug).toBeGreaterThan(0);
        expect(ref.venue.length, slug).toBeGreaterThan(0);
        expect(ref.year, `${slug} · ${ref.title}`).toBeGreaterThan(1800);
        expect(ref.year, `${slug} · ${ref.title}`).toBeLessThan(2100);
        expect(ref.url, `${slug} · ${ref.title}`).toMatch(/^https?:\/\/.+\..+/);
      }
    }
  });

  it("never repeats the island's own headline citation, and never itself", () => {
    // Identity is not the URL: doi.org/10.1126/science.aad6253 and
    // science.org/doi/10.1126/science.aad6253 are one paper on two hosts, and
    // showing both makes an island's shelf look fuller than its evidence is.
    const doiOf = (u: string) => u.match(/10\.\d{4,9}\/[^\s?#]+/)?.[0]?.toLowerCase() ?? null;
    const titleKey = (t: string) => t.toLowerCase().replace(/[^a-z0-9一-龥]/g, "");
    const keysOf = (title: string, url: string) => {
      const out = [`u:${norm(url)}`, `t:${titleKey(title)}`];
      const doi = doiOf(url);
      if (doi) out.push(`d:${doi}`);
      return out;
    };
    for (const slug of LITERATURE_SLUGS) {
      const island = bySlug.get(slug)!;
      const seen = new Set(keysOf(island.citation.title, island.citation.url));
      for (const ref of literatureBySlug(slug)) {
        for (const key of keysOf(ref.title, ref.url)) {
          expect(seen.has(key), `${slug} repeats "${ref.title}" (${key})`).toBe(false);
        }
        for (const key of keysOf(ref.title, ref.url)) seen.add(key);
      }
    }
  });

  it("returns an empty list — never undefined — for an island with no extra sources", () => {
    expect(literatureBySlug("no-such-island")).toEqual([]);
    const uncovered = FRONTIERS.find((f) => !LITERATURE_SLUGS.includes(f.slug));
    if (uncovered) expect(literatureBySlug(uncovered.slug)).toEqual([]);
  });
});
