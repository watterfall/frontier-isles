export type ModelLanguage = 'zh' | 'en';
export type ModelFamilyId = 'synchronization' | 'shared-field';
export type ModelSubstrateId =
  | 'fireflies'
  | 'heart-cells'
  | 'applause'
  | 'power-grid'
  | 'heat'
  | 'diffusion'
  | 'electrostatic'
  | 'steady-flow';

export type ModelText = Readonly<{ zh: string; en: string }>;

export interface ModelSource {
  title: string;
  url: string;
}

export interface ModelSubstrate {
  id: ModelSubstrateId;
  familyId: ModelFamilyId;
  title: ModelText;
  question: ModelText;
  entity: ModelText;
  interaction: ModelText;
  observable: ModelText;
  boundary: ModelText;
  source: ModelSource;
}

export interface ModelFamily {
  id: ModelFamilyId;
  title: ModelText;
  shortTitle: ModelText;
  invitation: ModelText;
  sharedRule: ModelText;
  entity: ModelText;
  perception: ModelText;
  update: ModelText;
  observable: ModelText;
  equation: string;
  equationKey: ModelText;
  structureIds: readonly string[];
  sources: readonly ModelSource[];
  substrates: readonly ModelSubstrate[];
}

export type ModelPrediction = 'increase' | 'stay' | 'decrease';

export interface ModelRunObservation {
  metric: 'coherence' | 'spread' | 'residual';
  initial: number;
  final: number;
  steps: number;
}

/** A learner-owned local record. It is not a ledger claim or evidence edge. */
export interface ModelRunReceipt {
  id: string;
  familyId: ModelFamilyId;
  substrateId: ModelSubstrateId;
  seed: number;
  parameters: Record<string, number>;
  prediction: ModelPrediction;
  observation: ModelRunObservation;
  boundary: string;
  language: ModelLanguage;
  sourceStructureId?: string;
  sourceProblemSlugs?: string[];
  createdAt: string;
}

export interface ModelLaunchContext {
  familyId?: ModelFamilyId;
  sourceStructureId?: string;
  sourceProblemSlugs?: string[];
}
