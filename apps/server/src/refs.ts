import { createHash } from "node:crypto";
import { canonicalStringify } from "@frontier-isles/opp";

/**
 * Content-addressed reference store keys.
 *
 * §5 ledger events carry only `ref: sha256:…`; the actual content (question
 * text, claim body, driftwood atom, morning-report draft, canvas snapshot…)
 * lives in the `refs` table. We hash with the same canonicalStringify + sha256
 * pattern opp uses for `hashEvent`, so a ref hash is stable and portable.
 */

/** Kind tag for a ref payload — purely descriptive, drives no schema. */
export type RefKind =
  | "question"
  | "claim"
  | "driftwood"
  | "bridge_artifact"
  | "morning_report"
  | "dock_proposal"
  | "ceremony"
  | "data_ref"
  | "hardware_ref"
  | "canvas_snapshot"
  | "note";

/** `sha256:<64 hex>` over the canonical JSON of `content`. */
export function refHash(content: unknown): string {
  const hex = createHash("sha256").update(canonicalStringify(content), "utf8").digest("hex");
  return `sha256:${hex}`;
}
