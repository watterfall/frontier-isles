import { describe, expect, it } from 'vitest';
import { projectExplorationCatalog, validateExplorationCatalog } from '../src/xfrontier-exploration';
const question = (id: string) => ({ id, q: id, q_en: id, set: 'great', clusters: ['C01'], epistemicBoundary: { claimTone: 'open-question', answerAsserted: false, sourceSupportsQuestionExistenceOnly: true } });
const structure = { dataset_version: 'xf-test', collisions: { items: [{ a: 'GQ-a', b: 'GQ-b', shared: 'shared', shared_en: 'shared', synthesis: 'question?', synthesis_en: 'question?' }] } };
const search = { dataset_version: 'xf-test', total: 2, offset: 0, nextCursor: null, items: [question('GQ-a'), question('GQ-b')] };
const project = (s: unknown = structure, q: unknown = search) => projectExplorationCatalog(s, q, '0.9.0', '2026-09-06T00:00:00Z');
describe('xFrontier exploration projection', () => {
  it('preserves question identities while dropping fields outside the read projection', () => {
    const result = project();
    expect(result.questions.map((q) => q.id)).toEqual(['GQ-a', 'GQ-b']);
    expect(result.questions[0]).not.toHaveProperty('scores');
    expect(validateExplorationCatalog(result)).toEqual(result);
  });
  it('rejects answers masquerading as open questions', () => {
    const items = structuredClone(search.items); items[0]!.epistemicBoundary.answerAsserted = true;
    expect(() => project(structure, { ...search, items })).toThrow('type wall');
  });
  it('rejects mixed versions and incomplete enumeration instead of joining them', () => {
    expect(() => project(structure, { ...search, dataset_version: 'xf-new' })).toThrow('Dataset changed');
    expect(() => project(structure, { ...search, total: 3 })).toThrow('Incomplete');
    expect(() => project(structure, { ...search, nextCursor: 'next' })).toThrow('Incomplete');
  });
  it('rejects dangling endpoints, self links and duplicates', () => {
    const result = project();
    expect(() => validateExplorationCatalog({ ...result, collisions: [{ ...result.collisions[0], b: 'GQ-missing' }] })).toThrow('endpoint');
    expect(() => validateExplorationCatalog({ ...result, collisions: [{ ...result.collisions[0], b: 'GQ-a' }] })).toThrow('endpoint');
    expect(() => validateExplorationCatalog({ ...result, collisions: [...result.collisions, ...result.collisions] })).toThrow('Duplicate');
  });
});
