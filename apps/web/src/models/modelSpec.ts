/** Declarative, bounded model specification and deterministic compiler. */

import {
  MODEL_RUNTIME_VERSION,
  advanceModelRuntime,
  createModelRuntime,
  modelObservation,
} from './runtime';
import type { ModelRunObservation, ModelSubstrateId } from './types';

export const MODEL_SPEC_VERSION = 1 as const;

type SynchronizationSubstrateId = Extract<ModelSubstrateId, 'fireflies' | 'heart-cells' | 'applause' | 'power-grid'>;
type SharedFieldSubstrateId = Extract<ModelSubstrateId, 'heat' | 'diffusion' | 'electrostatic' | 'steady-flow'>;

interface ModelSpecBaseV1 {
  readonly version: typeof MODEL_SPEC_VERSION;
  readonly id: string;
  readonly seed: number;
  readonly steps: number;
}

export interface SynchronizationModelSpecV1 extends ModelSpecBaseV1 {
  readonly familyId: 'synchronization';
  readonly substrateId: SynchronizationSubstrateId;
  readonly parameters: Readonly<{
    count: number;
    spread: number;
    coupling: number;
    dt: number;
  }>;
}

export interface SharedFieldModelSpecV1 extends ModelSpecBaseV1 {
  readonly familyId: 'shared-field';
  readonly substrateId: SharedFieldSubstrateId;
  readonly parameters: Readonly<{
    width: number;
    height: number;
    rate: number;
  }>;
}

export type ModelSpecV1 = SynchronizationModelSpecV1 | SharedFieldModelSpecV1;

export interface CompiledModelSpecV1 {
  readonly runtimeVersion: typeof MODEL_RUNTIME_VERSION;
  readonly spec: ModelSpecV1;
  run(): ModelRunObservation;
}

export class ModelSpecError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Invalid ModelSpecV1: ${issues.join('; ')}`);
    this.name = 'ModelSpecError';
    this.issues = issues;
  }
}

const SYNCHRONIZATION_SUBSTRATES = new Set<SynchronizationSubstrateId>([
  'fireflies',
  'heart-cells',
  'applause',
  'power-grid',
]);
const SHARED_FIELD_SUBSTRATES = new Set<SharedFieldSubstrateId>([
  'heat',
  'diffusion',
  'electrostatic',
  'steady-flow',
]);
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const inRange = (value: unknown, min: number, max: number): value is number =>
  finite(value) && value >= min && value <= max;
const integerInRange = (value: unknown, min: number, max: number): value is number =>
  Number.isSafeInteger(value) && (value as number) >= min && (value as number) <= max;

/** Parse unknown input strictly; kernels must never silently widen mission authority. */
export function normalizeModelSpec(value: unknown): ModelSpecV1 {
  if (!isRecord(value)) throw new ModelSpecError(['spec must be an object']);
  const issues: string[] = [];
  if (value.version !== MODEL_SPEC_VERSION) issues.push('version must be 1');
  if (typeof value.id !== 'string' || !value.id.trim()) issues.push('id is required');
  if (!Number.isSafeInteger(value.seed)) issues.push('seed must be a safe integer');
  if (!integerInRange(value.steps, 1, 5_000)) issues.push('steps must be an integer from 1 to 5000');
  if (!isRecord(value.parameters)) issues.push('parameters must be an object');

  if (value.familyId === 'synchronization') {
    if (typeof value.substrateId !== 'string' || !SYNCHRONIZATION_SUBSTRATES.has(value.substrateId as SynchronizationSubstrateId)) {
      issues.push('substrateId must belong to synchronization');
    }
    const parameters = isRecord(value.parameters) ? value.parameters : {};
    if (!integerInRange(parameters.count, 2, 120)) issues.push('count must be an integer from 2 to 120');
    if (!inRange(parameters.spread, 0, 1.2)) issues.push('spread must be from 0 to 1.2');
    if (!inRange(parameters.coupling, 0, 6)) issues.push('coupling must be from 0 to 6');
    if (!inRange(parameters.dt, 0.001, 0.2)) issues.push('dt must be from 0.001 to 0.2');
    if (issues.length > 0) throw new ModelSpecError(issues);
    return Object.freeze({
      version: MODEL_SPEC_VERSION,
      id: (value.id as string).trim(),
      familyId: 'synchronization',
      substrateId: value.substrateId as SynchronizationSubstrateId,
      seed: value.seed as number,
      steps: value.steps as number,
      parameters: Object.freeze({
        count: parameters.count as number,
        spread: parameters.spread as number,
        coupling: parameters.coupling as number,
        dt: parameters.dt as number,
      }),
    });
  }

  if (value.familyId === 'shared-field') {
    if (typeof value.substrateId !== 'string' || !SHARED_FIELD_SUBSTRATES.has(value.substrateId as SharedFieldSubstrateId)) {
      issues.push('substrateId must belong to shared-field');
    }
    const parameters = isRecord(value.parameters) ? value.parameters : {};
    if (!integerInRange(parameters.width, 6, 28)) issues.push('width must be an integer from 6 to 28');
    if (!integerInRange(parameters.height, 6, 28)) issues.push('height must be an integer from 6 to 28');
    if (!inRange(parameters.rate, 0, 1)) issues.push('rate must be from 0 to 1');
    if (issues.length > 0) throw new ModelSpecError(issues);
    return Object.freeze({
      version: MODEL_SPEC_VERSION,
      id: (value.id as string).trim(),
      familyId: 'shared-field',
      substrateId: value.substrateId as SharedFieldSubstrateId,
      seed: value.seed as number,
      steps: value.steps as number,
      parameters: Object.freeze({
        width: parameters.width as number,
        height: parameters.height as number,
        rate: parameters.rate as number,
      }),
    });
  }

  issues.push('familyId must be synchronization or shared-field');
  throw new ModelSpecError(issues);
}

export function compileModelSpec(value: unknown): CompiledModelSpecV1 {
  const spec = normalizeModelSpec(value);
  return Object.freeze({
    runtimeVersion: MODEL_RUNTIME_VERSION,
    spec,
    run: (): ModelRunObservation => {
      if (spec.familyId === 'synchronization') {
        const runtime = createModelRuntime(
          spec.familyId,
          spec.substrateId,
          spec.parameters.count,
          spec.parameters.spread,
          spec.seed,
        );
        return modelObservation(advanceModelRuntime(
          runtime,
          spec.parameters.coupling,
          0,
          spec.steps,
          spec.parameters.dt,
        ), spec.substrateId);
      }
      const runtime = createModelRuntime(
        spec.familyId,
        spec.substrateId,
        0,
        0,
        spec.seed,
        { width: spec.parameters.width, height: spec.parameters.height },
      );
      return modelObservation(advanceModelRuntime(
        runtime,
        0,
        spec.parameters.rate,
        spec.steps,
      ), spec.substrateId);
    },
  });
}

export const executeModelSpec = (value: unknown): ModelRunObservation => compileModelSpec(value).run();
