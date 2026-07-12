import { describe, it, expect } from "vitest";
import {
  StructureObjectSchema,
  serializeStructureObject,
  parseStructureObject,
  STRUCT_ID_RE,
} from "../src/structure-object";

describe("StructureObject", () => {
  const raw = {
    schema: "opp/0.3" as const,
    id: "struct://xfrontier/kuramoto",
    title: { zh: "耦合振子同步", en: "Coupled-oscillator synchronization" },
    statement: {
      zh: "大量弱耦合振子在临界耦合强度以上自发锁相。",
      en: "Weakly coupled oscillators spontaneously phase-lock above a critical coupling.",
    },
    status: "active" as const,
  };

  it("accepts a struct:// id", () => {
    expect(STRUCT_ID_RE.test(raw.id)).toBe(true);
    expect(() => StructureObjectSchema.parse(raw)).not.toThrow();
  });

  it("round-trips through markdown (§6 leavability)", () => {
    const obj = StructureObjectSchema.parse(raw);
    const md = serializeStructureObject(obj);
    const back = parseStructureObject(md);
    expect(back).toEqual(obj);
  });

  it("rejects an op:// id in the structure slot", () => {
    expect(() => StructureObjectSchema.parse({ ...raw, id: "op://x/prob/y" })).toThrow();
  });

  it("requires non-empty bilingual title + statement (structure ≠ a bare label, §五)", () => {
    expect(() => StructureObjectSchema.parse({ ...raw, statement: { zh: "", en: "" } })).toThrow();
  });
});
