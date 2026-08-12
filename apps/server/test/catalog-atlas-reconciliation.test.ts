import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { openDb } from "../src/db.js";
import { seed, seedWithReport } from "../src/seed.js";
import { CatalogAtlasIdentityConflict, Store, type ProblemMeta } from "../src/store.js";

interface RawProblemRow {
  op_id: string;
  slug: string;
  md_source: string;
  title: string;
  status: string;
  qfocus: string;
  json: string;
}

const ACTIVE_SLUG = "formal-math";
const WITHDRAWN_SLUG = "perennial-grain-crops";
const FIRST_CATALOG_SLUG = "compositional-modeling";
const LAST_CATALOG_SLUG = "physical-interposer-confidential-computing";

let store: Store;

const rawProblem = (slug: string): RawProblemRow =>
  store.db
    .prepare(
      "SELECT op_id, slug, md_source, title, status, qfocus, json FROM problem_objects WHERE slug = ?",
    )
    .get(slug) as RawProblemRow;

const replaceMeta = (slug: string, meta: unknown): void => {
  store.db.prepare("UPDATE problem_objects SET json = ? WHERE slug = ?").run(JSON.stringify(meta), slug);
};

beforeEach(() => {
  store = new Store(openDb(":memory:"));
  seed(store);
});

afterEach(() => {
  store.db.close();
});

describe("catalog atlas projection reconciliation", () => {
  it("is a byte-for-byte no-op when the stored projection is current", () => {
    const before = rawProblem(ACTIVE_SLUG);

    expect(seedWithReport(store)).toEqual({ materialized: 0, reconciled: 0 });
    expect(rawProblem(ACTIVE_SLUG)).toEqual(before);
  });

  it("refuses to claim an existing slug whose catalog identity is missing", () => {
    const current = store.getProblemRow(ACTIVE_SLUG)!;
    const { atlas: _atlas, ...legacyMeta } = current.meta;
    replaceMeta(ACTIVE_SLUG, legacyMeta);
    const ambiguous = rawProblem(ACTIVE_SLUG);

    expect(() => seedWithReport(store)).toThrowError(CatalogAtlasIdentityConflict);
    expect(rawProblem(ACTIVE_SLUG)).toEqual(ambiguous);
  });

  it("restores a catalog record's withdrawal lifecycle metadata", () => {
    const current = store.getProblemRow(WITHDRAWN_SLUG)!;
    const expectedWithdrawal = current.meta.atlas!.atlasWithdrawal;
    expect(expectedWithdrawal).toMatchObject({
      status: "withdrawn",
      reason: "too_mature_or_applied",
    });

    const staleMeta = structuredClone(current.meta);
    delete staleMeta.atlas!.atlasWithdrawal;
    replaceMeta(WITHDRAWN_SLUG, staleMeta);

    expect(seedWithReport(store)).toEqual({ materialized: 0, reconciled: 1 });
    expect(store.getProblemRow(WITHDRAWN_SLUG)!.meta.atlas!.atlasWithdrawal).toEqual(expectedWithdrawal);
  });

  it("rejects a slug occupied by another atlas identity and rolls back earlier reconciliation", () => {
    const first = store.getProblemRow(FIRST_CATALOG_SLUG)!;
    replaceMeta(FIRST_CATALOG_SLUG, {
      ...first.meta,
      atlas: { ...first.meta.atlas!, brief: { zh: "事务内旧值", en: "stale within transaction" } },
    });
    const staleFirst = rawProblem(FIRST_CATALOG_SLUG);

    const last = store.getProblemRow(LAST_CATALOG_SLUG)!;
    replaceMeta(LAST_CATALOG_SLUG, {
      ...last.meta,
      atlas: { ...last.meta.atlas!, atlasN: last.meta.atlas!.atlasN + 100_000 },
    });
    const conflictingLast = rawProblem(LAST_CATALOG_SLUG);

    expect(() => seedWithReport(store)).toThrowError(CatalogAtlasIdentityConflict);
    expect(rawProblem(FIRST_CATALOG_SLUG)).toEqual(staleFirst);
    expect(rawProblem(LAST_CATALOG_SLUG)).toEqual(conflictingLast);
  });

  it("does not inspect or rewrite a non-catalog problem row", () => {
    const source = rawProblem(ACTIVE_SLUG);
    const sourceMeta = JSON.parse(source.json) as ProblemMeta;
    store.db
      .prepare(
        `INSERT INTO problem_objects (op_id, slug, md_source, title, status, qfocus, json)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        "op://frontier-isles/prob/user-owned-island",
        "user-owned-island",
        source.md_source,
        "User-owned title",
        "active",
        "User-owned focus",
        JSON.stringify({
          domain: "local",
          chart: { x: 1, y: 2, scale: 3, activity: 4 },
          atlas: { ...sourceMeta.atlas!, atlasN: -999, extension: "not a catalog projection" },
        }),
      );
    const before = rawProblem("user-owned-island");

    expect(seedWithReport(store)).toEqual({ materialized: 0, reconciled: 0 });
    expect(rawProblem("user-owned-island")).toEqual(before);
  });

  it("preserves authored columns, other metadata, unknown extensions, and place rows", () => {
    const before = rawProblem(ACTIVE_SLUG);
    const currentMeta = JSON.parse(before.json) as ProblemMeta;
    const expectedAtlas = structuredClone(currentMeta.atlas!);
    const authoredMd = `${before.md_source}\n<!-- locally-authored-marker -->\n`;
    const localMeta = {
      ...currentMeta,
      domain: "local-domain",
      name: "Local chart name",
      chart: { ...currentMeta.chart, x: -321, activity: 99 },
      localExtension: { owner: "island", revision: 7 },
      atlas: { ...expectedAtlas, scores: Array(9).fill(1) },
    };
    store.db
      .prepare(
        `UPDATE problem_objects
         SET md_source = ?, title = ?, status = ?, qfocus = ?, json = ?
         WHERE slug = ?`,
      )
      .run(
        authoredMd,
        "Local column title",
        "open",
        "Local column qfocus",
        JSON.stringify(localMeta),
        ACTIVE_SLUG,
      );

    store.db
      .prepare("UPDATE stations SET gx = ?, gy = ?, level = ? WHERE op_id = ? AND kind = ?")
      .run(97, 98, 4, before.op_id, "dock");
    const stationBefore = store.db
      .prepare("SELECT gx, gy, level FROM stations WHERE op_id = ? AND kind = ?")
      .get(before.op_id, "dock");

    expect(seedWithReport(store)).toEqual({ materialized: 0, reconciled: 1 });

    const after = rawProblem(ACTIVE_SLUG);
    expect(after).toMatchObject({
      op_id: before.op_id,
      slug: before.slug,
      md_source: authoredMd,
      title: "Local column title",
      status: "open",
      qfocus: "Local column qfocus",
    });
    const { atlas, ...preservedMeta } = JSON.parse(after.json) as typeof localMeta;
    const { atlas: _staleAtlas, ...expectedMeta } = localMeta;
    expect(preservedMeta).toEqual(expectedMeta);
    expect(atlas).toEqual(expectedAtlas);
    expect(
      store.db.prepare("SELECT gx, gy, level FROM stations WHERE op_id = ? AND kind = ?").get(before.op_id, "dock"),
    ).toEqual(stationBefore);
  });

  it("does not rewrite or append to the island ledger or its referenced artifact", () => {
    const row = store.getProblemRow(ACTIVE_SLUG)!;
    const artifact = { source: "local-research", observation: "keep this ref exactly" };
    const ref = store.putRef("note", artifact);
    store.appendRaw(row.opId, {
      ts: "2026-08-12T00:00:00.000Z",
      op: row.object.id,
      actor: { id: "github:local-researcher", kind: "human" },
      credit: ["investigation"],
      phase: "A",
      action: "night_digest",
      ref,
    });

    const ledgerBefore = store.db
      .prepare("SELECT seq, op_id, hash, prev, json FROM ledger_events WHERE op_id = ? ORDER BY seq")
      .all(row.opId);
    const refBefore = store.db.prepare("SELECT hash, kind, json FROM refs WHERE hash = ?").get(ref);
    replaceMeta(ACTIVE_SLUG, {
      ...row.meta,
      atlas: { ...row.meta.atlas!, citation: { url: "stale", title: "stale", venue: "stale", year: 0 } },
    });

    expect(seedWithReport(store)).toEqual({ materialized: 0, reconciled: 1 });
    expect(
      store.db.prepare("SELECT seq, op_id, hash, prev, json FROM ledger_events WHERE op_id = ? ORDER BY seq").all(row.opId),
    ).toEqual(ledgerBefore);
    expect(store.db.prepare("SELECT hash, kind, json FROM refs WHERE hash = ?").get(ref)).toEqual(refBefore);
    expect(store.getRef(ref)).toEqual({ kind: "note", content: artifact });
  });
});
