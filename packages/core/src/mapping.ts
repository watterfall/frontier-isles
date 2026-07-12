import { z } from "zod";

/**
 * The human-authored mapping a `rebuild` event points at (执行纲要 §九;
 * 定位说明 §5.1). This is the ONE step that may never be delegated to AI
 * (§六.1): "看出这个陌生的新东西,对应规律里的哪个量" — that is understanding
 * itself. A rebuild event carries `ref: sha256:…` → this object in the refs
 * table (events never inline content).
 */

const Bilingual = z.object({ zh: z.string().min(1), en: z.string().min(1) });

export const MappingArtifactSchema = z.object({
  /** Which structure was rebuilt here. */
  structureId: z.string().regex(/^struct:\/\//, "must be a struct:// id"),
  /** Which island (substrate) it was rebuilt onto. */
  islandOp: z.string().regex(/^op:\/\//, "must be an op:// id"),
  /** quantity in the structure ↦ what it corresponds to in this substrate.
   *  At least one — a mapping with no correspondences is not a rebuild. */
  correspondences: z
    .array(z.object({ quantity: Bilingual, inThisSubstrate: Bilingual }))
    .min(1),
  /** "若这成立,我们就应该观察到 X" — the falsifiable prediction (§七). */
  prediction: Bilingual.optional(),
  /** Optional pointers to the real data/record this rebuild was checked against. */
  evidenceRefs: z.array(z.string()).optional(),
});

export type MappingArtifact = z.infer<typeof MappingArtifactSchema>;
