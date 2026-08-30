import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SEED_STRUCTURES } from '@frontier-isles/data/structures';
import { FRONTIERS } from '@frontier-isles/data/frontiers';
import { inboundRelations, seedStructureById } from '../../../api/structureFallback';
import { StructureReading, type StructureReadingSource } from '../StructureReading';

// What React's static renderer does to text; the authored content is checked
// through the same transform so a quote or ampersand in a sentence cannot
// turn a real match into a false failure.
const esc = (text: string): string => text
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');

const source: StructureReadingSource = { byId: seedStructureById, inboundOf: inboundRelations };
const SYNC = 'struct://xfrontier/synchronization';
const sync = seedStructureById(SYNC)!;

describe('StructureReading — the structure itself, independent of any island', () => {
  it('renders origin, minimal form, quantities, textbook instances, relations and mistakenFor from the catalogue', () => {
    const markup = renderToStaticMarkup(<StructureReading structureId={SYNC} lang="zh" source={source} onSelectStructure={() => {}} />);
    expect(markup).toContain('data-depth="true"');
    expect(markup).toContain('这个主题本身');
    expect(markup).toContain(esc(sync.depth!.origin.zh));
    expect(markup).toContain(esc(sync.depth!.minimalForm!));
    for (const quantity of sync.quantities!) expect(markup).toContain(esc(quantity.name.zh));
    for (const substrate of sync.depth!.canonicalSubstrates) {
      expect(markup).toContain(esc(substrate.name.zh));
      expect(markup).toContain(esc(substrate.boundary.zh));
    }
    for (const relation of sync.depth!.relations) {
      expect(markup).toContain(`data-structure-id="${relation.to}"`);
      expect(markup).toContain(esc(relation.why.zh));
    }
    expect(markup).toContain(esc(sync.depth!.mistakenFor.zh));
  });

  it('shows who cites a structure, read off the other structures\' relations', () => {
    // synchronization is the target of relations authored on other structures;
    // the reverse index is what lets a reader standing here see them.
    const inbound = inboundRelations(SYNC);
    expect(inbound.length).toBeGreaterThan(0);
    const markup = renderToStaticMarkup(<StructureReading structureId={SYNC} lang="zh" source={source} />);
    for (const relation of inbound) {
      expect(markup).toContain(`data-structure-id="${relation.from}"`);
      expect(markup).toContain(esc(relation.why.zh));
    }
    expect(markup).toContain('data-direction="in"');
  });

  it('reads the same object in English', () => {
    const markup = renderToStaticMarkup(<StructureReading structureId={SYNC} lang="en" source={source} />);
    expect(markup).toContain('The structure itself');
    expect(markup).toContain(esc(sync.depth!.origin.en));
    expect(markup).toContain(esc(sync.depth!.mistakenFor.en));
    expect(markup).not.toContain(esc(sync.depth!.origin.zh));
  });

  it('follows a relation through a real button only when navigation is offered', () => {
    const withNav = renderToStaticMarkup(<StructureReading structureId={SYNC} lang="zh" source={source} onSelectStructure={() => {}} />);
    expect(withNav).toMatch(/<button[^>]*class="fi-structure-reading-link fi-hit"[^>]*data-structure-id="struct:\/\/xfrontier\/critical-slowing-down"/);
    const readOnly = renderToStaticMarkup(<StructureReading structureId={SYNC} lang="zh" source={source} />);
    expect(readOnly).not.toContain('fi-structure-reading-link');
    expect(readOnly).toContain('data-structure-id="struct://xfrontier/critical-slowing-down"');
  });

  it('states the gap honestly for a structure that carries no depth yet', () => {
    const bare = SEED_STRUCTURES.find((structure) => !structure.depth)!;
    const markup = renderToStaticMarkup(<StructureReading structureId={bare.id} lang="zh" source={source} />);
    expect(markup).toContain('data-depth="false"');
    expect(markup).toContain('这是内容上的空白，不是它没有关系');
    expect(markup).not.toContain('教科书里的样子');
    expect(markup).not.toContain('常被误当成');
  });

  it('renders nothing while the catalogue has not loaded, and nothing for an unknown id', () => {
    expect(renderToStaticMarkup(<StructureReading structureId={SYNC} lang="zh" source={null} />)).toBe('');
    expect(renderToStaticMarkup(<StructureReading structureId="struct://xfrontier/does-not-exist" lang="zh" source={source} />)).toBe('');
  });

  it('marks a relation whose target is itself still one sentence, before the reader clicks it', () => {
    // Derived, never hard-coded: as families are written, today's dashed link
    // becomes solid, and pinning a pair would make this test a calendar.
    const byId = new Map(SEED_STRUCTURES.map((structure) => [structure.id, structure]));
    const pair = SEED_STRUCTURES
      .flatMap((structure) => (structure.depth?.relations ?? []).map((relation) => ({ from: structure.id, to: relation.to })))
      .find(({ to }) => !byId.get(to)?.depth);
    if (!pair) return; // Every structure written up — the mark has nothing left to say.
    const markup = renderToStaticMarkup(
      <StructureReading structureId={pair.from} lang="zh" source={source} onSelectStructure={() => {}} />,
    );
    expect(markup).toMatch(new RegExp(`data-structure-id="${pair.to}" data-target-written="false"`));
    const written = byId.get(pair.from)!.depth!.relations.map((relation) => relation.to).find((to) => byId.get(to)?.depth);
    if (written) expect(markup).toContain(`data-structure-id="${written}" data-target-written="true"`);
  });

  it('never mentions an island: the reading is the structure layer, not the atlas', () => {
    const slugs = FRONTIERS.map((island) => island.slug);
    for (const structure of SEED_STRUCTURES.filter((candidate) => candidate.depth).slice(0, 12)) {
      const markup = renderToStaticMarkup(<StructureReading structureId={structure.id} lang="zh" source={source} />);
      for (const slug of slugs) expect(markup.includes(`"${slug}"`), `${structure.id} mentions ${slug}`).toBe(false);
    }
  });
});
