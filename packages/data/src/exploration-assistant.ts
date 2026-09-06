import { object } from './xfrontier-exploration.js';

export interface ExplorationMove {
  kind: 'bridge' | 'challenge' | 'probe';
  title: string;
  question: string;
  reason: string;
  boundary: string;
  questionIds: string[];
}
export interface ExplorationReply {
  reply: string;
  moves: ExplorationMove[];
  datasetVersion: string;
  model: string;
  createdAt: string;
  sources: { id: string; title: string; url: string }[];
}

/** Validate model output as proposals. No output can create a research claim. */
export function parseExplorationProposal(value: unknown, knownIds: readonly string[]): Pick<ExplorationReply, 'reply' | 'moves'> {
  const input = object(value);
  const bounded = (v: unknown, max: number) => {
    if (typeof v !== 'string' || !v.trim() || v.length > max) throw new Error('Invalid proposal text');
    return v.trim();
  };
  if (!Array.isArray(input.moves) || input.moves.length < 1 || input.moves.length > 3) throw new Error('Invalid moves');
  const moves = input.moves.map((value) => {
    const m = object(value);
    if (!['bridge', 'challenge', 'probe'].includes(String(m.kind))) throw new Error('Invalid move kind');
    if (!Array.isArray(m.questionIds) || m.questionIds.length < 1 || m.questionIds.length > 3 || !m.questionIds.every((id) => typeof id === 'string' && knownIds.includes(id))) throw new Error('Unknown question');
    return { kind: m.kind as ExplorationMove['kind'], title: bounded(m.title, 120), question: bounded(m.question, 1000), reason: bounded(m.reason, 1600), boundary: bounded(m.boundary, 1000), questionIds: [...new Set(m.questionIds as string[])] };
  });
  return { reply: bounded(input.reply, 4000), moves };
}

export const EXPLORATION_PROPOSAL_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['reply', 'moves'],
  properties: {
    reply: { type: 'string' },
    moves: { type: 'array', minItems: 1, maxItems: 3, items: {
      type: 'object', additionalProperties: false,
      required: ['kind', 'title', 'question', 'reason', 'boundary', 'questionIds'],
      properties: {
        kind: { type: 'string', enum: ['bridge', 'challenge', 'probe'] },
        title: { type: 'string' }, question: { type: 'string' }, reason: { type: 'string' }, boundary: { type: 'string' },
        questionIds: { type: 'array', minItems: 1, maxItems: 3, items: { type: 'string' } },
      },
    } },
  },
} as const;
