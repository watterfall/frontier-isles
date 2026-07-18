import { z } from "zod";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

/**
 * Structure-object front-matter schema — the machine contract of a `struct://`
 * structure (a cross-substrate regularity: 同步 / 标度 / 网络级联 …). It is the
 * portable "structure" half of the 结构 ⇄ 现象 bipartite graph (执行纲要 §九;
 * 定位说明 §4.2/§5.3). A structure is NOT a discipline label sitting above the
 * four domains (§五 red-line): it carries only its own regularity, never a domain.
 * Like the problem object, it round-trips through markdown (§6 leavability).
 */

/** `struct://<org>/<slug>` */
export const STRUCT_ID_RE = /^struct:\/\/[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]*$/;
export const StructId = z.string().regex(STRUCT_ID_RE, "must be struct://<org>/<slug>");

const Bilingual = z.object({ zh: z.string().min(1), en: z.string().min(1) });

/** proposed = freshly minted (B4 mint); active = in play; retired = superseded. */
export const StructureStatusSchema = z.enum(["proposed", "active", "retired"]);
export type StructureStatus = z.infer<typeof StructureStatusSchema>;

/** Editorial programme used to orient the structure lens and island interiors.
 * It is deliberately NOT a discipline/domain: a structure still cuts across
 * substrates, while the theme only tells a reader what kind of transfer to
 * look for. */
export const StructureThemeSchema = z.enum([
  "collective-dynamics",
  "causal-inference",
  "unknown-mapping",
  "knowledge-commons",
  "living-computation",
  "simulation-twins",
]);
export type StructureTheme = z.infer<typeof StructureThemeSchema>;

/** Visible source note for an editorial structure. Graph edges never come from
 * this metadata; they still come exclusively from human-authored rebuild refs. */
export const StructureProvenanceSchema = z.object({
  source: z.string().min(1),
  url: z.string().url(),
  recordIds: z.array(z.number().int().positive()).max(16).default([]),
  reviewedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD"),
});
export type StructureProvenance = z.infer<typeof StructureProvenanceSchema>;

export const StructureObjectSchema = z.object({
  schema: z.literal("opp/0.3"),
  id: StructId,
  /** Editorial name (zh primary + en gloss, invariant 9). */
  title: Bilingual,
  /** The regularity in one sentence. NOT a discipline classification (§五). */
  statement: Bilingual,
  status: StructureStatusSchema,
  /** Optional for backward compatibility with pre-theme structure Markdown. */
  theme: StructureThemeSchema.optional(),
  /** Legacy xfrontier isomorphism handle retained as portable provenance. */
  isomorphism: z.string().min(1).optional(),
  provenance: StructureProvenanceSchema.optional(),
  license: z.string().default("CC-BY-4.0"),
});

export type StructureObject = z.infer<typeof StructureObjectSchema>;
/** Shape of the raw (pre-default) front-matter accepted by the schema. */
export type StructureObjectInput = z.input<typeof StructureObjectSchema>;

const FRONT_MATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

/** Serialize a structure object to `.md` (YAML front-matter, mirrors the
 *  problem-object contract in markdown.ts). Structures carry no prose body. */
export function serializeStructureObject(object: StructureObject): string {
  const frontMatter = stringifyYaml(object).replace(/\n+$/, "");
  return `---\n${frontMatter}\n---\n`;
}

/** Parse a structure-object `.md`: validate the front-matter against the schema. */
export function parseStructureObject(md: string): StructureObject {
  const m = FRONT_MATTER_RE.exec(md);
  if (!m) {
    throw new Error("structure object is missing its `---` front-matter fence");
  }
  const raw = parseYaml(m[1] ?? "");
  return StructureObjectSchema.parse(raw);
}
