import type { ActorKind } from "@frontier-isles/opp";
import type { Label } from "./atoms";

/**
 * Human role ladder and AI-resident templates (architecture.md §3).
 * Promotion up the ladder is peer-confirmed, never automatic. Humans and
 * agents share one permission model (see capabilities.ts), distinguished by
 * actor kind.
 */

export const ROLE_LADDER = ["visitor", "apprentice", "researcher", "resident", "master"] as const;
export type Role = (typeof ROLE_LADDER)[number];

export const ROLE_META: Record<Role, Label> = {
  visitor: { zh: "访客", en: "visitor" },
  apprentice: { zh: "学徒", en: "apprentice" },
  researcher: { zh: "研究员", en: "researcher" },
  resident: { zh: "常驻", en: "resident" },
  master: { zh: "山长", en: "master" },
};

/** Re-exported from the protocol so callers get one canonical union. */
export type { ActorKind };
export const ACTOR_KINDS = ["human", "agent", "pair"] as const;

export const AI_RESIDENT_KINDS = [
  "literature-scout",
  "devils-advocate",
  "synthesizer",
  "ferryman",
] as const;
export type AiResidentKind = (typeof AI_RESIDENT_KINDS)[number];

export interface AiResidentTemplate {
  kind: AiResidentKind;
  zh: string;
  en: string;
  /** Seal glyph (斥/辩/综/联). */
  seal: string;
  /** Only the connection steward works across islands. */
  crossIsland: boolean;
  /** Default granted capabilities for this resident template. */
  capabilities: string[];
}

export const AI_RESIDENT_TEMPLATES: Record<AiResidentKind, AiResidentTemplate> = {
  "literature-scout": {
    kind: "literature-scout",
    zh: "文献斥候",
    en: "literature scout",
    seal: "斥",
    crossIsland: false,
    capabilities: ["propose", "driftwood_write"],
  },
  "devils-advocate": {
    kind: "devils-advocate",
    zh: "魔鬼辩护人",
    en: "devil's advocate",
    seal: "辩",
    crossIsland: false,
    capabilities: ["propose", "driftwood_write"],
  },
  synthesizer: {
    kind: "synthesizer",
    zh: "综合者",
    en: "synthesizer",
    seal: "综",
    crossIsland: false,
    capabilities: ["propose", "driftwood_write"],
  },
  ferryman: {
    kind: "ferryman",
    zh: "连接协调员",
    en: "connection steward",
    seal: "联",
    crossIsland: true, // the only cross-island agent
    capabilities: ["propose", "driftwood_write", "bridge_propose"], // bridge-proposal rights only
  },
};
