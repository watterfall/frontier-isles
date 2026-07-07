/**
 * Driftwood atoms (six) and bridge artifacts (four) — architecture.md §3.
 * Atoms are what the Night produces in the Driftwood Garden; bridge artifacts
 * are the four shapes a transplant takes as it passes through the Ferry Dock.
 */

export const ATOM_TYPES = [
  "thought",
  "question",
  "metaphor",
  "sketch",
  "contradiction",
  "thought-experiment",
] as const;
export type AtomType = (typeof ATOM_TYPES)[number];

export interface Label {
  zh: string;
  en: string;
}

export const ATOM_LABELS: Record<AtomType, Label> = {
  thought: { zh: "想法", en: "thought" },
  question: { zh: "问题", en: "question" },
  metaphor: { zh: "隐喻", en: "metaphor" },
  sketch: { zh: "草图", en: "sketch" },
  contradiction: { zh: "矛盾", en: "contradiction" },
  "thought-experiment": { zh: "思想实验", en: "thought-experiment" },
};

export const BRIDGE_ARTIFACT_TYPES = [
  "analogy-mapping",
  "hypothesis-formalization",
  "concept-prototype",
  "design-fiction",
] as const;
export type BridgeArtifactType = (typeof BRIDGE_ARTIFACT_TYPES)[number];

export const BRIDGE_ARTIFACT_LABELS: Record<BridgeArtifactType, Label> = {
  "analogy-mapping": { zh: "类比映射", en: "analogy mapping" },
  "hypothesis-formalization": { zh: "假设形式化", en: "hypothesis formalization" },
  "concept-prototype": { zh: "概念原型", en: "concept prototype" },
  "design-fiction": { zh: "设计虚构", en: "design fiction" },
};
