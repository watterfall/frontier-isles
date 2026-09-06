import { describe, expect, it } from 'vitest';
import snapshot from '../data/exploration-catalog.json';
import { validateExplorationCatalog } from '@frontier-isles/data/xfrontier-exploration';
import { beginExpedition, expeditionMarkdown, parseExpeditionNotebook } from '../state/collisionExpedition';
const catalog = validateExplorationCatalog(snapshot);
const make = () => beginExpedition(catalog, catalog.collisions[0]!);
describe('personal collision expeditions', () => {
  it('pins the exact question pair and edition and round-trips through storage', () => {
    const entry = make(); const notebook = { version: 1, selectedId: entry.id, entries: [entry] };
    expect(entry.source.questions).toHaveLength(2);
    expect(parseExpeditionNotebook(JSON.stringify(notebook))).toEqual(notebook);
    expect(expeditionMarkdown(entry, 'en')).toContain(catalog.datasetVersion);
  });
  it('preserves free-form questions, AI provenance and model receipts without completion scoring', () => {
    const entry = make();
    entry.notes = [{ id: 'note-1', kind: 'model', text: 'Observed a change, no prior prediction.', createdAt: entry.updatedAt, attribution: 'local toy model', attachment: '{"prediction":null}' }];
    const parsed = parseExpeditionNotebook(JSON.stringify({ version: 1, selectedId: entry.id, entries: [entry] }));
    expect(parsed.entries[0]?.notes).toEqual(entry.notes);
    expect(expeditionMarkdown(entry, 'en')).toContain('local toy model');
    expect(expeditionMarkdown(entry, 'en')).not.toContain('## Hypothesis');
    expect(expeditionMarkdown(entry, 'en')).not.toContain('Evidence kind: literature');
    entry.notes[0]!.text = 'x'.repeat(12001);
    expect(() => parseExpeditionNotebook(JSON.stringify({ version: 1, entries: [entry] }))).toThrow('notes');
  });
  it('rejects source corruption rather than silently relinking a draft', () => {
    const entry = make(); entry.id = 'other';
    expect(() => parseExpeditionNotebook(JSON.stringify({ version: 1, entries: [entry] }))).toThrow('source');
    expect(() => parseExpeditionNotebook('{bad')).toThrow();
  });
  it('exports the actual user evidence and its kind without claiming validation', () => {
    const entry = make(); entry.fields.evidence = 'Simulation run 4: unstable above threshold'; entry.evidenceKind = 'simulation'; entry.outcome = 'unclear';
    const md = expeditionMarkdown(entry, 'en');
    expect(md).toContain(entry.fields.evidence); expect(md).toContain('simulation'); expect(md).toContain('not scientific validation');
  });
});
