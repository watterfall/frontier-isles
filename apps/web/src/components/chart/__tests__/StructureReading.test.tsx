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
    // Depth now covers all 126, so this case has to be constructed rather than
    // found. It is still live behaviour: the next structure added arrives
    // without a body, and what the reader sees then is this sentence.
    const stub: StructureReadingSource = {
      byId: (id) => {
        const structure = seedStructureById(id);
        return structure ? { ...structure, depth: undefined } : undefined;
      },
      inboundOf: () => inboundRelations(SYNC),
    };
    const markup = renderToStaticMarkup(<StructureReading structureId={SYNC} lang="zh" source={stub} />);
    expect(markup).toContain('data-depth="false"');
    expect(markup).toContain('这是内容上的空白，不是它没有关系');
    expect(markup).not.toContain('教科书里的样子');
    expect(markup).not.toContain('常被误当成');
    // The inbound half still renders: a structure with no body of its own is
    // not a structure nothing points at, and saying so is the sentence's claim.
    expect(markup).toContain('被这些主题引用');
  });

  it('renders nothing while the catalogue has not loaded, and nothing for an unknown id', () => {
    expect(renderToStaticMarkup(<StructureReading structureId={SYNC} lang="zh" source={null} />)).toBe('');
    expect(renderToStaticMarkup(<StructureReading structureId="struct://xfrontier/does-not-exist" lang="zh" source={source} />)).toBe('');
  });

  it('marks a relation whose target is itself still one sentence, before the reader clicks it', () => {
    // Driven by a stub source, NOT the live catalogue. Every structure now has
    // a body, so a catalogue-derived version of this test would asserts nothing
    // and still pass — the exact vacuous-coverage failure this repository keeps
    // an observation record about. The mark has to keep working for the next
    // structure added without one, so the test supplies that structure itself.
    const real = seedStructureById(SYNC)!;
    const target = real.depth!.relations[0]!.to;
    const stub: StructureReadingSource = {
      byId: (id) => {
        const structure = seedStructureById(id);
        if (!structure) return undefined;
        // Strip the body from the first relation's target only.
        return id === target ? { ...structure, depth: undefined } : structure;
      },
      inboundOf: () => [],
    };
    const markup = renderToStaticMarkup(
      <StructureReading structureId={SYNC} lang="zh" source={stub} onSelectStructure={() => {}} />,
    );
    expect(markup).toContain(`data-structure-id="${target}" data-target-written="false"`);
    const other = real.depth!.relations.find((relation) => relation.to !== target)?.to;
    if (other) expect(markup).toContain(`data-structure-id="${other}" data-target-written="true"`);
  });

  it('marks every relation as written while the catalogue is in fact complete', () => {
    // The live counterpart of the test above: as long as depth covers all 126,
    // no reading may render a dashed link. If a structure lands without a body
    // this goes red, which is the signal to check the mark still reads right.
    const bare = SEED_STRUCTURES.filter((structure) => !structure.depth);
    const markup = renderToStaticMarkup(
      <StructureReading structureId={SYNC} lang="zh" source={source} onSelectStructure={() => {}} />,
    );
    expect(markup).toContain('data-target-written="true"');
    if (bare.length === 0) expect(markup).not.toContain('data-target-written="false"');
  });

  it('never mentions an island: the reading is the structure layer, not the atlas', () => {
    const slugs = FRONTIERS.map((island) => island.slug);
    for (const structure of SEED_STRUCTURES.filter((candidate) => candidate.depth).slice(0, 12)) {
      const markup = renderToStaticMarkup(<StructureReading structureId={structure.id} lang="zh" source={source} />);
      for (const slug of slugs) expect(markup.includes(`"${slug}"`), `${structure.id} mentions ${slug}`).toBe(false);
    }
  });
});
