/**
 * StructureReading — the readable body of ONE cross-disciplinary structure,
 * independent of any island: its own quantities, where it was first stated,
 * its tightest form, textbook instances with their own boundaries, how it
 * stands to other structures, and what it is routinely mistaken for.
 *
 * Why this exists. The catalogue's `depth` field (packages/data
 * `structures-depth-*.ts`) was authored so a structure with no rebuilt island
 * still has content, and so the structure layer carries relations the mapping
 * layer never could. Until this component none of it reached a reader: both
 * the server's `ApiStructure` and the offline `fallbackStructures()` project
 * only title/statement/status/provenance, so the connection explorer showed
 * one sentence per 主题 and nothing behind it.
 *
 * Data path. The catalogue is ~261KiB and sits behind `api/structureFallback`,
 * which must only ever be reached through `import()` (vite's entry guard). The
 * hook below is that door; the body component is pure and takes the resolved
 * source as a prop so it renders identically online, offline and under
 * `renderToStaticMarkup`. Depth is authored catalogue content, like an island's
 * `atlas.depth`: it is not ledger truth and creates no edge, which is why it is
 * read here from the package rather than routed through the research ledger.
 */
import { useEffect, useState } from 'react';
import type { SeedStructure, StructureRelationKind } from '@frontier-isles/data/structures';
import type { StructureInboundRelation } from '../../api/structureFallback';

export interface StructureReadingSource {
  byId: (id: string) => SeedStructure | undefined;
  inboundOf: (id: string) => StructureInboundRelation[];
}

/** Lazily opens the seed catalogue. Returns null until it has loaded (or while
 *  disabled), so a screen that never focuses a structure never pays for it. */
export function useStructureReadingSource(enabled: boolean): StructureReadingSource | null {
  const [source, setSource] = useState<StructureReadingSource | null>(null);
  useEffect(() => {
    if (!enabled || source) return;
    let alive = true;
    void import('../../api/structureFallback').then((module) => {
      if (!alive) return;
      setSource({ byId: module.seedStructureById, inboundOf: module.inboundRelations });
    });
    return () => { alive = false; };
  }, [enabled, source]);
  return source;
}

const COPY = {
  zh: {
    title: '这个主题本身',
    kind: { regularity: '规律', method: '方法' } as Record<string, string>,
    origin: '来历',
    form: '最小形式',
    quantities: '它自己的量',
    failsWhen: '什么时候不再成立',
    substrates: '教科书里的样子',
    inSubstrate: '在这里是',
    boundary: '在这里要停住',
    relations: '与其他主题的关系',
    inbound: '被这些主题引用',
    mistakenFor: '常被误当成',
    open: '打开这个主题',
    openGap: '打开这个主题（它目前只有一句陈述）',
    gap: '这个主题目前只有一句陈述。它的来历、教科书实例和与其他主题的关系还没有写出——这是内容上的空白，不是它没有关系。',
    kinds: {
      'emerges-from': '涌现自',
      generates: '会产生',
      'special-case-of': '是其特例',
      explains: '解释了',
      'competes-with': '与之竞争',
    } satisfies Record<StructureRelationKind, string>,
  },
  en: {
    title: 'The structure itself',
    kind: { regularity: 'regularity', method: 'method' } as Record<string, string>,
    origin: 'Origin',
    form: 'Minimal form',
    quantities: 'Its own quantities',
    failsWhen: 'When it stops holding',
    substrates: 'Textbook instances',
    inSubstrate: 'here it is',
    boundary: 'where it must stop here',
    relations: 'How it stands to other structures',
    inbound: 'Cited by these structures',
    mistakenFor: 'Routinely mistaken for',
    open: 'Open this structure',
    openGap: 'Open this structure (it currently carries one sentence)',
    gap: 'This structure currently carries one sentence. Its origin, textbook instances and relations to other structures are not yet written — a content gap, not an absence of relations.',
    kinds: {
      'emerges-from': 'emerges from',
      generates: 'generates',
      'special-case-of': 'is a special case of',
      explains: 'explains',
      'competes-with': 'competes with',
    } satisfies Record<StructureRelationKind, string>,
  },
} as const;

export interface StructureReadingProps {
  structureId: string;
  lang: 'zh' | 'en';
  /** Null while the catalogue is still loading — the body renders nothing
   *  rather than a placeholder, so the surrounding panel keeps its shape. */
  source: StructureReadingSource | null;
  /** Follow a relation to another structure. Absent = relations are read-only. */
  onSelectStructure?: (structureId: string) => void;
}

export function StructureReading({ structureId, lang, source, onSelectStructure }: StructureReadingProps) {
  if (!source) return null;
  const structure = source.byId(structureId);
  if (!structure) return null;
  const copy = COPY[lang];
  const read = (value: { zh: string; en: string } | undefined): string =>
    value?.[lang] || value?.[lang === 'zh' ? 'en' : 'zh'] || '';
  const titleOf = (id: string): string => read(source.byId(id)?.title) || id.replace('struct://xfrontier/', '');
  const depth = structure.depth;
  const quantities = structure.quantities ?? [];
  const inbound = source.inboundOf(structureId);

  // A relation may point at a structure that is itself still one sentence. The
  // reader should know that before clicking rather than after: dashed is this
  // interface's existing mark for an honest gap.
  const written = (id: string): boolean => !!source.byId(id)?.depth;
  const structureLink = (id: string) => onSelectStructure
    ? (
      <button
        type="button"
        className="fi-structure-reading-link fi-hit"
        data-structure-id={id}
        data-target-written={written(id) ? 'true' : 'false'}
        onClick={() => onSelectStructure(id)}
        title={written(id) ? copy.open : copy.openGap}
      >
        {titleOf(id)}
      </button>
    )
    : <b data-structure-id={id} data-target-written={written(id) ? 'true' : 'false'}>{titleOf(id)}</b>;

  return (
    <section className="fi-structure-reading" data-testid="structure-reading" data-depth={depth ? 'true' : 'false'} aria-label={copy.title}>
      <header>
        <h4>{copy.title}</h4>
        {structure.kind && <em data-kind={structure.kind}>{copy.kind[structure.kind]}</em>}
      </header>

      {depth && (
        <p className="fi-structure-reading-origin"><b>{copy.origin}</b>{read(depth.origin)}</p>
      )}
      {depth?.minimalForm && (
        <p className="fi-structure-reading-form"><b>{copy.form}</b><code>{depth.minimalForm}</code></p>
      )}

      {quantities.length > 0 && (
        <dl className="fi-structure-reading-quantities" aria-label={copy.quantities}>
          {quantities.map((quantity, index) => (
            <div key={index}><dt>{read(quantity.name)}</dt><dd>{read(quantity.role)}</dd></div>
          ))}
        </dl>
      )}

      {structure.failsWhen && (
        <p className="fi-structure-reading-fails"><b>{copy.failsWhen}</b>{read(structure.failsWhen)}</p>
      )}

      {depth ? (
        <>
          <h5>{copy.substrates}<small>{depth.canonicalSubstrates.length}</small></h5>
          <ol className="fi-structure-reading-substrates">
            {depth.canonicalSubstrates.map((substrate, index) => (
              <li key={index}>
                <header><strong>{read(substrate.name)}</strong><small>{read(substrate.field)}</small></header>
                <p><em>{read(quantities[substrate.quantity]?.name)}</em> {copy.inSubstrate} {read(substrate.inThisSubstrate)}</p>
                <p className="fi-structure-reading-boundary"><b>{copy.boundary}</b>{read(substrate.boundary)}</p>
              </li>
            ))}
          </ol>

          {(depth.relations.length > 0 || inbound.length > 0) && (
            <>
              <h5>{copy.relations}<small>{depth.relations.length + inbound.length}</small></h5>
              <ul className="fi-structure-reading-relations">
                {depth.relations.map((relation) => (
                  <li key={`out:${relation.to}`} data-direction="out" data-kind={relation.kind}>
                    <span><b>{read(structure.title)}</b> <em>{copy.kinds[relation.kind]}</em> {structureLink(relation.to)}</span>
                    <p>{read(relation.why)}</p>
                  </li>
                ))}
                {inbound.map((relation) => (
                  <li key={`in:${relation.from}`} data-direction="in" data-kind={relation.kind}>
                    <span>{structureLink(relation.from)} <em>{copy.kinds[relation.kind]}</em> <b>{read(structure.title)}</b></span>
                    <p>{read(relation.why)}</p>
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className="fi-structure-reading-mistaken"><b>{copy.mistakenFor}</b>{read(depth.mistakenFor)}</p>
        </>
      ) : (
        <>
          {inbound.length > 0 && (
            <>
              <h5>{copy.inbound}<small>{inbound.length}</small></h5>
              <ul className="fi-structure-reading-relations">
                {inbound.map((relation) => (
                  <li key={`in:${relation.from}`} data-direction="in" data-kind={relation.kind}>
                    <span>{structureLink(relation.from)} <em>{copy.kinds[relation.kind]}</em> <b>{read(structure.title)}</b></span>
                    <p>{read(relation.why)}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="fi-structure-reading-gap">{copy.gap}</p>
        </>
      )}
    </section>
  );
}
