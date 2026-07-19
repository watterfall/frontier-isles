import { createPortal } from 'react-dom';
import { useMemo, useState } from 'react';
import { api, type ApiCurrentRecord } from '../../api/client';
import type { Bilingual } from '../../api/fallback';
import type {
  ConnectionChannel,
  ConnectionConvergence,
  ConnectionField,
  ConnectionFocus,
  ConnectionPath,
  ConnectionProblem,
} from '../../chart/connectionField';
import { pathInChannel, relatedResponsePaths, searchConnectionProblems } from '../../chart/connectionField';
import type { PassageIntent, StructureDeparture } from '../../state/explorationSession';
import type { ModelLaunchContext } from '../../models/types';

export interface ConnectionFieldPanelProps {
  field: ConnectionField;
  lang: 'zh' | 'en';
  channel: ConnectionChannel;
  focus: ConnectionFocus;
  visible: boolean;
  departure: StructureDeparture | null;
  intent: PassageIntent | null;
  actor?: string;
  onChannel: (channel: ConnectionChannel) => void;
  onFocus: (focus: ConnectionFocus) => void;
  onVisible: (visible: boolean) => void;
  onDeparture: (departure: StructureDeparture) => void;
  onPassage: (intent: PassageIntent, problem: ConnectionProblem) => void;
  onEnter: (problem: ConnectionProblem) => void;
  onResponseRecorded?: (pathId: string) => void;
  onBuildModel?: (launch: ModelLaunchContext) => void;
}

const COPY = {
  zh: {
    aria: '跨领域研究对照', kicker: '已有研究记录', title: '从别的研究里找办法',
    intro: '每条记录都说明：能借什么、哪里不能照搬、怎么验证。',
    collapse: '收起', expand: '展开', show: '显示连线', hide: '隐藏连线',
    search: '先选一个你正在研究的问题', searchPlaceholder: '输入问题或现象', searchEmpty: '还没有与这个问题匹配的记录。',
    filter: '筛选这些对照', all: '全部', mechanism: '同一种办法', form: '模型、方程或可借用做法', evidence: '支持或反对的材料', lineage: '方法怎样被沿用',
    mechanisms: '同一种办法，用在不同问题上', direct: '两项研究之间的具体判断', problem: '项研究', problems: '项研究', record: '条记录', records: '条记录',
    global: '返回所有对照', shared: '能借用什么', appears: '在这项研究里具体是什么', boundary: '哪里不能照搬',
    boundaryMissing: '这条旧记录没有写明差异，不能据此把两个问题当成一回事。',
    prediction: '怎么验证', evidenceRefs: '依据', author: '记录人', revisions: '条记录',
    view: '打开这个问题', chooseSource: '从这里开始比较', source: '已选为起点', compare: '对照这两个问题',
    collisions: '这几项研究之间还有不同判断', formulaBoundary: '用了同一个方程，不代表两边的原因相同。还要分别检查边界条件、参数代表什么，以及实际因果过程。',
    ledgerBoundary: '这只是一条支持、反对或借用的记录，不代表两个问题相同。看检验结果和新材料，再决定它是否站得住。',
    focusProblem: '这个问题可以对照', noRelations: '还没有记录说明其他研究能怎样帮助这个问题。',
    proposed: '尚未验证', ratified: '已有确认记录', support: '支持', contest: '反对', mapLegend: '筛选这些对照',
    reviewGroup: '查看哪里相同、哪里不同', reviewPath: '查看理由和检验', structureRecord: '记录名称', usedHere: '两边共同用到',
    sourceLedger: '研究记录', sourceCurated: '整理的数学材料',
    dossier: '这条判断依据什么', dossierIntro: '原材料、支持或反对的理由，以及可能推翻它的测试。',
    assertion: '原材料说了什么', response: '支持或反对的理由', discriminatingTest: '什么结果会让这条判断站不住',
    targetMissing: '可以打开原记录，但这里还没有摘要。', responseMissing: '这条旧记录没有保存理由。',
    testMissing: '这条旧记录没有保存检验方法。', evidenceMissing: '没有附上可核对的材料。',
    recordedAction: '判断', by: '记录人', openRef: '查看原记录', targetEvidence: '原材料', responseEvidence: '回应依据',
    writeResponse: '补充支持或反对的理由', writeIntro: '用“{{to}}”的材料回应“{{from}}”。写入后其他人可以继续核对。',
    target: '你在回应哪条材料', position: '你的判断', validate: '这些材料支持它', refute: '这些材料反对它',
    bridgeValidate: '这次对应经得起检验', bridgeRefute: '这次对应在此断裂',
    relatedResponses: '关于这次对应的跨岛回应', viewPath: '查看这条回应',
    returnFalsified: '将被证伪的材料退回散木园', returned: '已退回散木园',
    returnFalsifiedNote: '锚定岛的人工决定 · 材料化作「矛盾」原子重新入园，可再移栽',
    errorNotFalsified: '这份材料没有在案的反驳记录。', errorAlreadyReturned: '这份材料已经退回过散木园。',
    argument: '具体哪里支持或反对', argumentHint: '说明你比较了什么、哪些地方相同、哪些地方不能照搬。',
    test: '什么结果会让你改变判断', testHint: '写下一个可以观察、实验或复现的结果。',
    crate: '证据来源（RO-Crate）', hash: '材料的 sha256 哈希', role: '这份材料用于', evidenceRole: '提供依据', replicationRole: '复现检查',
    submitResponse: '保存这条判断', saving: '正在保存…', responseSaved: '已保存，正在更新对照。',
    responseProposed: '代理建议已交给人复核，尚未改变判断。', actorMissing: '当前没有可归属的身份，不能保存。',
    errorDenied: '你没有权限从这项研究保存支持或反对材料。', errorEvidence: '请补全证据来源和有效的 sha256 哈希。',
    errorTarget: '这条原材料已经不存在，或不再接受公开回应。', errorSameIsland: '同一项研究内部的反驳不属于跨领域对照。',
    errorNetwork: '暂时无法连接记录服务。请保留文字，稍后重试。', errorGeneric: '这条判断没有保存。请检查内容后重试。',
    desktopWrite: '手机可以完整阅读；补充理由请使用桌面端。',
    buildModel: '不用只看解释：亲手搭这个模型',
  },
  en: {
    aria: 'Research comparisons across fields', kicker: 'Recorded research comparisons', title: 'Find a useful idea in another study',
    intro: 'Every record states what can transfer, what cannot be copied, and how to test it.',
    collapse: 'Collapse', expand: 'Expand', show: 'Show lines', hide: 'Hide lines',
    search: 'Choose a problem you are working on', searchPlaceholder: 'Search a problem or phenomenon', searchEmpty: 'No recorded comparison matches this problem yet.',
    filter: 'Filter these comparisons', all: 'All', mechanism: 'The same approach', form: 'Models, equations, or reusable approaches', evidence: 'Material that supports or challenges', lineage: 'How a method was reused',
    mechanisms: 'The same approach, used on different problems', direct: 'A concrete judgment between two studies', problem: 'study', problems: 'studies', record: 'record', records: 'records',
    global: 'Back to all comparisons', shared: 'What can transfer', appears: 'What it is in this study', boundary: 'What cannot be copied',
    boundaryMissing: 'This older record did not state the difference, so it cannot justify treating the problems as the same.',
    prediction: 'How to test it', evidenceRefs: 'Sources', author: 'Recorded by', revisions: 'records',
    view: 'Open this problem', chooseSource: 'Start comparing here', source: 'Selected starting point', compare: 'Compare these problems',
    collisions: 'These studies also contain different judgments', formulaBoundary: 'Using the same equation does not mean the causes are the same. Check the boundary conditions, what each parameter means, and the actual causal process separately.',
    ledgerBoundary: 'This is one recorded judgment of support, challenge, or reuse; it does not make the problems identical. Use the test and new material to decide whether it holds.',
    focusProblem: 'This problem can be compared with', noRelations: 'No record yet explains how another study could help with this problem.',
    proposed: 'Not yet verified', ratified: 'Confirmed in a record', support: 'Supports', contest: 'Challenges', mapLegend: 'Filter these comparisons',
    reviewGroup: 'See what matches and what differs', reviewPath: 'See the reasons and test', structureRecord: 'Record name', usedHere: 'Used in both studies',
    sourceLedger: 'Research record', sourceCurated: 'Curated mathematical material',
    dossier: 'What this judgment is based on', dossierIntro: 'The source material, the reason for support or challenge, and a test that could overturn it.',
    assertion: 'What the source material says', response: 'Reason for support or challenge', discriminatingTest: 'What result would make this judgment fail',
    targetMissing: 'The original record can be opened, but no summary is available here.', responseMissing: 'This older record did not preserve its reason.',
    testMissing: 'This older record did not preserve a test.', evidenceMissing: 'No checkable material was attached.',
    recordedAction: 'Judgment', by: 'Recorded by', openRef: 'View original record', targetEvidence: 'Source material', responseEvidence: 'Material used in the response',
    writeResponse: 'Add a reason to support or challenge', writeIntro: 'Use material from “{{to}}” to respond to “{{from}}”. Other people can then check it.',
    target: 'Material you are responding to', position: 'Your judgment', validate: 'This material supports it', refute: 'This material challenges it',
    bridgeValidate: 'The correspondence holds under this material', bridgeRefute: 'The correspondence breaks here',
    relatedResponses: 'Cross-island responses about this correspondence', viewPath: 'View this response',
    returnFalsified: 'Return the falsified material to the Driftwood Garden', returned: 'Returned to the Garden',
    returnFalsifiedNote: 'The anchor island\'s human decision · the material re-enters the Garden as a contradiction atom, transplantable again',
    errorNotFalsified: 'This material has no refutation on record.', errorAlreadyReturned: 'This material was already returned to the Garden.',
    argument: 'Exactly what supports or challenges it', argumentHint: 'State what you compared, what matches, and what cannot be copied.',
    test: 'What result would change your judgment', testHint: 'Name an observable, experimental, or reproducible result.',
    crate: 'Evidence source (RO-Crate)', hash: 'Material sha256 hash', role: 'This material is for', evidenceRole: 'Supporting the judgment', replicationRole: 'Replication check',
    submitResponse: 'Save this judgment', saving: 'Saving…', responseSaved: 'Saved; updating the comparison.',
    responseProposed: 'The agent suggestion is waiting for human review and has not changed the judgment.', actorMissing: 'No attributable identity is available, so this cannot be saved.',
    errorDenied: 'You do not have permission to save supporting or challenging material from this study.', errorEvidence: 'Add the evidence source and a valid sha256 hash.',
    errorTarget: 'The source material is gone or no longer accepts a public response.', errorSameIsland: 'A challenge within one study is not a cross-field comparison.',
    errorNetwork: 'The record service is unavailable. Keep your text and try again later.', errorGeneric: 'This judgment was not saved. Check the fields and try again.',
    desktopWrite: 'You can read everything on mobile; use desktop to add a reason.',
    buildModel: 'Do not just read it: build this model',
  },
} as const;

const CHANNELS: ConnectionChannel[] = ['all', 'mechanism', 'form', 'evidence', 'lineage'];

const localized = (value: Bilingual | undefined, lang: 'zh' | 'en'): string =>
  value?.[lang] || value?.[lang === 'zh' ? 'en' : 'zh'] || '';

const handleOf = (actor: string): string => `@${actor.split(':').at(-1) ?? actor}`;

function pathStatement(path: ConnectionPath, lang: 'zh' | 'en'): string {
  if (path.kind === 'mathematical') {
    return lang === 'zh'
      ? `两边都用到：${localized(path.label, lang)}`
      : `Both use: ${localized(path.label, lang)}`;
  }
  return localized(path.label, lang);
}

function pathPair(path: ConnectionPath, lang: 'zh' | 'en'): string {
  return `${localized(path.from.title, lang)} ${lang === 'zh' ? '与' : 'and'} ${localized(path.to.title, lang)}`;
}

const counted = (count: number, singular: string, plural: string): string =>
  `${count} ${count === 1 ? singular : plural}`;

function RelationMark({ kind }: { kind: ConnectionPath['kind'] | 'mechanism' }) {
  return <i className="fi-connection-mark" data-kind={kind} aria-hidden="true"><span /></i>;
}

export function ConnectionFieldPanel(props: ConnectionFieldPanelProps) {
  const { field, lang, channel, focus, visible, departure, intent, actor, onChannel, onFocus, onVisible, onDeparture, onPassage, onEnter, onResponseRecorded, onBuildModel } = props;
  const c = COPY[lang];
  const [expanded, setExpanded] = useState(true);
  const [query, setQuery] = useState('');
  const searchResults = useMemo(() => searchConnectionProblems(field, query, lang), [field, query, lang]);
  const activeGroup = focus?.type === 'convergence' ? field.convergences.find((group) => group.id === focus.id) ?? null : null;
  const activePath = focus?.type === 'path' ? field.paths.find((path) => path.id === focus.id) ?? null : null;
  const activeProblem = focus?.type === 'problem' ? field.problems.get(focus.slug) ?? null : null;

  const selectChannel = (next: ConnectionChannel) => {
    onFocus(null);
    onChannel(next);
  };

  const panel = (
    <aside className="fi-connection-field" data-expanded={expanded || undefined} aria-label={c.aria}>
      <header className="fi-connection-head">
        <button type="button" className="fi-connection-expand" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
          <span aria-hidden="true">⌁</span>
          <span><small>{c.kicker}</small><strong>{c.title}</strong></span>
          <b>{expanded ? '−' : '+'}</b>
        </button>
        <button type="button" className="fi-connection-visibility" aria-pressed={visible} onClick={() => onVisible(!visible)}>
          {visible ? c.hide : c.show}
        </button>
      </header>

      {expanded && (
        <div className="fi-connection-body">
          {!focus && <p className="fi-connection-intro">{c.intro}</p>}

          {!focus && (
            <div className="fi-connection-search">
              <label htmlFor="fi-connection-query">{c.search}</label>
              <input
                id="fi-connection-query"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value.slice(0, 160))}
                placeholder={c.searchPlaceholder}
                autoComplete="off"
              />
              {query.trim() && (
                <ul aria-label={c.search}>
                  {searchResults.map((problem) => (
                    <li key={problem.slug}>
                      <button type="button" onClick={() => { setQuery(''); onFocus({ type: 'problem', slug: problem.slug }); }}>
                        <strong>{localized(problem.title, lang)}</strong>
                        <small>{localized(problem.question, lang)}</small>
                      </button>
                    </li>
                  ))}
                  {searchResults.length === 0 && <li><p>{c.searchEmpty}</p></li>}
                </ul>
              )}
            </div>
          )}

          {!focus && (
            <details className="fi-connection-filters">
              <summary><span>{c.filter}</span><strong>{c[channel]}</strong></summary>
              <nav className="fi-connection-channels" aria-label={c.mapLegend}>
                {CHANNELS.map((item) => (
                  <button key={item} type="button" aria-pressed={channel === item} onClick={() => selectChannel(item)}>
                    {c[item]}
                  </button>
                ))}
              </nav>
            </details>
          )}

          {focus && (
            <button type="button" className="fi-connection-back" onClick={() => onFocus(null)}>← {c.global}</button>
          )}

          {activeGroup
            ? <ConvergenceDetail group={activeGroup} field={field} lang={lang} copy={c} departure={departure} intent={intent} onDeparture={onDeparture} onPassage={onPassage} onEnter={onEnter} onFocus={onFocus} onBuildModel={onBuildModel} />
            : activePath
              ? <PathDetail key={activePath.id} path={activePath} lang={lang} copy={c} actor={actor} onEnter={onEnter} onResponseRecorded={onResponseRecorded} related={activePath.kind === 'bridge' ? relatedResponsePaths(field, activePath) : []} onFocusPath={(id) => onFocus({ type: 'path', id })} />
              : activeProblem
                ? <ProblemDetail problem={activeProblem} field={field} lang={lang} copy={c} onFocus={onFocus} onEnter={onEnter} />
                : <GlobalField field={field} lang={lang} channel={channel} copy={c} onFocus={onFocus} />}
        </div>
      )}
    </aside>
  );
  return typeof document !== 'undefined' ? createPortal(panel, document.body) : panel;
}

function GlobalField({ field, lang, channel, copy, onFocus }: {
  field: ConnectionField;
  lang: 'zh' | 'en';
  channel: ConnectionChannel;
  copy: typeof COPY.zh | typeof COPY.en;
  onFocus: (focus: ConnectionFocus) => void;
}) {
  const groups = channel === 'all' || channel === 'mechanism' ? field.convergences : [];
  const paths = field.paths.filter((path) => pathInChannel(path, channel));
  return (
    <div className="fi-connection-index">
      {groups.length > 0 && (
        <section aria-labelledby="fi-connection-groups-title">
          <h2 id="fi-connection-groups-title">{copy.mechanisms}<small>{groups.length}</small></h2>
          <ol>
            {groups.map((group) => (
              <li key={group.id}>
                <button type="button" onClick={() => onFocus({ type: 'convergence', id: group.id })}>
                  <RelationMark kind="mechanism" />
                  <span>
                    <strong>{localized(group.sharedCore, lang)}</strong>
                    <small>{group.members.map((member) => localized(member.problem.title, lang)).join(' · ')}</small>
                    <em>{counted(group.members.length, copy.problem, copy.problems)} · {counted(group.weight, copy.record, copy.records)} · {copy.reviewGroup}</em>
                  </span>
                  <b aria-hidden="true">↗</b>
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}
      {paths.length > 0 && (
        <section aria-labelledby="fi-connection-paths-title">
          <h2 id="fi-connection-paths-title">{copy.direct}<small>{paths.length}</small></h2>
          <ol>
            {paths.map((path) => (
              <li key={path.id}>
                <button type="button" onClick={() => onFocus({ type: 'path', id: path.id })}>
                  <RelationMark kind={path.kind} />
                  <span>
                    <strong>{pathPair(path, lang)}</strong>
                    <small>{pathStatement(path, lang)}</small>
                    <em>{counted(path.weight, copy.record, copy.records)}{path.maturity ? ` · ${path.maturity === 'ratified' ? copy.ratified : copy.proposed}` : ''} · {copy.reviewPath}</em>
                  </span>
                  <b aria-hidden="true">↗</b>
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

function ConvergenceDetail({ group, field, lang, copy, departure, intent, onDeparture, onPassage, onEnter, onFocus, onBuildModel }: {
  group: ConnectionConvergence;
  field: ConnectionField;
  lang: 'zh' | 'en';
  copy: typeof COPY.zh | typeof COPY.en;
  departure: StructureDeparture | null;
  intent: PassageIntent | null;
  onDeparture: (departure: StructureDeparture) => void;
  onPassage: (intent: PassageIntent, problem: ConnectionProblem) => void;
  onEnter: (problem: ConnectionProblem) => void;
  onFocus: (focus: ConnectionFocus) => void;
  onBuildModel?: (launch: ModelLaunchContext) => void;
}) {
  const memberSlugs = new Set(group.members.map((member) => member.problem.slug));
  const crossing = field.paths.filter((path) => memberSlugs.has(path.from.slug) && memberSlugs.has(path.to.slug));
  return (
    <article className="fi-connection-detail" data-kind="mechanism">
      <header>
        <RelationMark kind="mechanism" />
        <span><small>{copy.structureRecord}: {localized(group.title, lang)} · {group.members.length} {copy.problems}</small><h2>{localized(group.sharedCore, lang)}</h2></span>
      </header>
      {group.provenance && (
        <a className="fi-connection-source-note" href={group.provenance.url} target="_blank" rel="noopener noreferrer">
          {copy.evidenceRefs}: {group.provenance.source}{group.provenance.recordIds.length ? ` · #${group.provenance.recordIds.join(' · #')}` : ''} ↗
        </a>
      )}
      {group.structureId === 'struct://xfrontier/synchronization' && onBuildModel && (
        <button type="button" className="fi-connection-model-action" data-model-launch="connection" onClick={() => onBuildModel({
          familyId: 'synchronization',
          sourceStructureId: group.structureId,
          sourceProblemSlugs: group.members.map((member) => member.problem.slug),
        })}>{copy.buildModel} →</button>
      )}
      <ol className="fi-connection-manifestations">
        {group.members.map((member, index) => {
          const mapping = member.mapping;
          const isDeparture = departure?.structureId === group.structureId && departure.islandSlug === member.problem.slug;
          const isIntent = intent?.structureId === group.structureId && intent.targetIslandSlug === member.problem.slug;
          return (
            <li key={member.problem.slug} data-departure={isDeparture || undefined} data-intent={isIntent || undefined}>
              <header>
                <b>{String(index + 1).padStart(2, '0')}</b>
                <span><small>{member.problem.domain}</small><h3>{localized(member.problem.title, lang)}</h3><p>{localized(member.problem.question, lang)}</p></span>
              </header>
              <section>
                <h4>{copy.appears}</h4>
                <dl>
                  {mapping.correspondences.map((item, itemIndex) => (
                    <div key={`${member.problem.slug}:${itemIndex}`}>
                      <dt>{localized(item.quantity, lang)}</dt><dd>{localized(item.inThisSubstrate, lang)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              <section className="fi-connection-boundary" data-missing={!mapping.boundary || undefined}>
                <h4>{copy.boundary}</h4>
                <p>{mapping.boundary ? localized(mapping.boundary, lang) : copy.boundaryMissing}</p>
              </section>
              {mapping.prediction && <section className="fi-connection-test"><h4>{copy.prediction}</h4><p>{localized(mapping.prediction, lang)}</p></section>}
              {mapping.evidenceRefs?.length ? <section className="fi-connection-refs"><h4>{copy.evidenceRefs}</h4>{mapping.evidenceRefs.map((ref) => <code key={ref}>{ref}</code>)}</section> : null}
              <footer>
                <small>{copy.author}: {handleOf(mapping.actor)} · {counted(member.records.length, copy.record, copy.revisions)}</small>
                <div>
                  <button type="button" onClick={() => onEnter(member.problem)}>{copy.view}</button>
                  {!isDeparture && !departure && (
                    <button type="button" onClick={() => onDeparture({ structureId: group.structureId, islandSlug: member.problem.slug, islandOp: mapping.islandOp })}>{copy.chooseSource}</button>
                  )}
                  {isDeparture && <span>{copy.source}</span>}
                  {departure?.structureId === group.structureId && !isDeparture && (
                    <button type="button" className="is-primary" onClick={() => onPassage({
                      ...departure,
                      targetIslandSlug: member.problem.slug,
                      targetIslandOp: mapping.islandOp,
                      passageKind: 'charted',
                    }, member.problem)}>{copy.compare}</button>
                  )}
                </div>
              </footer>
            </li>
          );
        })}
      </ol>
      {crossing.length > 0 && (
        <section className="fi-connection-crossings">
          <h3>{copy.collisions}</h3>
          {crossing.map((path) => (
            <button type="button" key={path.id} onClick={() => onFocus({ type: 'path', id: path.id })}>
              <RelationMark kind={path.kind} /><span>{localized(path.label, lang)}<small>{localized(path.from.title, lang)} ↔ {localized(path.to.title, lang)}</small></span>
            </button>
          ))}
        </section>
      )}
    </article>
  );
}

function PathDetail({ path, lang, copy, actor, onEnter, onResponseRecorded, related = [], onFocusPath }: {
  path: ConnectionPath;
  lang: 'zh' | 'en';
  copy: typeof COPY.zh | typeof COPY.en;
  actor?: string;
  onEnter: (problem: ConnectionProblem) => void;
  onResponseRecorded?: (pathId: string) => void;
  /** Signed sibling responses about this path's targets (bridge dossier join). */
  related?: ConnectionPath[];
  onFocusPath?: (id: string) => void;
}) {
  const boundary = path.kind === 'mathematical' ? copy.formulaBoundary : copy.ledgerBoundary;
  return (
    <article className="fi-connection-detail" data-kind={path.kind}>
      <header><RelationMark kind={path.kind} /><span><small>{pathStatement(path, lang)}</small><h2>{pathPair(path, lang)}</h2></span></header>
      {path.detail && <section className="fi-connection-core"><h3>{copy.usedHere}</h3><strong>{localized(path.label, lang)}</strong><p className={path.kind === 'mathematical' ? 'is-formula' : ''}>{localized(path.detail, lang)}</p></section>}
      <div className="fi-connection-pair">
        {[path.from, path.to].map((problem) => (
          <section key={problem.slug}>
            <small>{problem.domain}</small><h3>{localized(problem.title, lang)}</h3><p>{localized(problem.question, lang)}</p>
            {problem.brief && <p>{localized(problem.brief, lang)}</p>}
            <button type="button" onClick={() => onEnter(problem)}>{copy.view}</button>
          </section>
        ))}
      </div>
      {path.source === 'ledger' && <ConnectionDossier path={path} lang={lang} copy={copy} actor={actor} onResponseRecorded={onResponseRecorded} />}
      {related.length > 0 && (
        <section className="fi-connection-related" aria-labelledby="fi-connection-related-title">
          <h3 id="fi-connection-related-title">{copy.relatedResponses}</h3>
          <ul>
            {related.map((sibling) => (
              <li key={sibling.id}>
                <span>{sibling.sign === 'contest' ? '⊣' : '→'} {pathStatement(sibling, lang)}</span>
                <small>{localized(sibling.to.title, lang)} · {counted(sibling.weight, copy.record, copy.records)}</small>
                {onFocusPath && <button type="button" onClick={() => onFocusPath(sibling.id)}>{copy.viewPath}</button>}
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="fi-connection-boundary"><h3>{copy.boundary}</h3><p>{boundary}</p></section>
      {path.source === 'ledger' && (path.kind === 'evidence' || path.kind === 'contradiction' || path.kind === 'bridge') && (
        <ConnectionResponseForm
          path={path}
          lang={lang}
          copy={copy}
          actor={actor}
          onResponseRecorded={onResponseRecorded}
        />
      )}
      <footer className="fi-connection-path-meta">
        <span>{path.maturity === 'proposed' ? copy.proposed : path.maturity === 'ratified' ? copy.ratified : path.sign === 'contest' ? copy.contest : copy.support}</span>
        <small>{counted(path.weight, copy.record, copy.records)} · {path.source === 'ledger' ? copy.sourceLedger : copy.sourceCurated}</small>
      </footer>
    </article>
  );
}

function refUrl(ref: string): string {
  return `/api/refs/${encodeURIComponent(ref)}`;
}

function formatRecordTime(ts: string, lang: 'zh' | 'en'): string {
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return ts;
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);
}

function EvidenceLine({ title, evidence, missing, evidenceRole, replicationRole }: {
  title: string;
  evidence: ApiCurrentRecord['targetEvidence'];
  missing: string;
  evidenceRole: string;
  replicationRole: string;
}) {
  return (
    <div className="fi-connection-evidence" data-missing={!evidence || undefined}>
      <strong>{title}</strong>
      {evidence ? (
        <span>
          <a href={evidence.ro_crate} target="_blank" rel="noopener noreferrer">{evidence.role === 'replication' ? replicationRole : evidenceRole} ↗</a>
          <code>{evidence.hash}</code>
        </span>
      ) : <p>{missing}</p>}
    </div>
  );
}

function ReturnFalsifiedControl({ path, record, copy, actor, onResponseRecorded }: {
  path: ConnectionPath;
  record: ApiCurrentRecord;
  copy: typeof COPY.zh | typeof COPY.en;
  actor?: string;
  onResponseRecorded?: (pathId: string) => void;
}) {
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const submit = async () => {
    if (!actor) {
      setState('error');
      setMessage(copy.actorMissing);
      return;
    }
    setState('saving');
    setMessage('');
    const outcome = await api.returnFalsified(path.from.slug, { targetRef: record.targetRef, actor });
    if (!outcome.ok) {
      setState('error');
      setMessage(responseError(copy, outcome.code, outcome.status));
      return;
    }
    setState('done');
    onResponseRecorded?.(path.id);
  };
  return (
    <div className="fi-connection-response fi-connection-return">
      <button type="button" onClick={submit} disabled={state === 'saving' || state === 'done' || !actor}>
        {state === 'done' ? copy.returned : copy.returnFalsified}
      </button>
      <small>{copy.returnFalsifiedNote}</small>
      {message && state === 'error' && <p role="alert">{message}</p>}
    </div>
  );
}

function ConnectionDossier({ path, lang, copy, actor, onResponseRecorded }: {
  path: ConnectionPath;
  lang: 'zh' | 'en';
  copy: typeof COPY.zh | typeof COPY.en;
  actor?: string;
  onResponseRecorded?: (pathId: string) => void;
}) {
  return (
    <section className="fi-connection-dossier" aria-labelledby="fi-connection-dossier-title">
      <header>
        <div><h3 id="fi-connection-dossier-title">{copy.dossier}</h3><p>{copy.dossierIntro}</p></div>
      </header>
      {path.records.length > 0 ? (
        <ol>
          {path.records.map((record, index) => {
            const isEvidenceAction = record.action === 'validate' || record.action === 'refute';
            const judgment = record.action === 'validate'
              ? copy.validate
              : record.action === 'refute'
                ? copy.refute
                : pathStatement(path, lang);
            return (
              <li key={`${record.targetRef}:${record.responseRef ?? record.ts}:${index}`} data-historical={record.historical || undefined}>
                <header>
                  <b>{String(index + 1).padStart(2, '0')}</b>
                  <span><strong>{copy.recordedAction}: {judgment}</strong><small>{copy.by} {handleOf(record.actor)} · <time dateTime={record.ts}>{formatRecordTime(record.ts, lang)}</time></small></span>
                </header>
                <section data-step="source">
                  <h4>{copy.assertion}</h4>
                  <p>{record.targetSummary ?? copy.targetMissing}</p>
                  <a href={refUrl(record.targetRef)} target="_blank" rel="noopener noreferrer">{copy.openRef} ↗</a>
                  <code>{record.targetRef}</code>
                  <EvidenceLine title={copy.targetEvidence} evidence={record.targetEvidence} missing={copy.evidenceMissing} evidenceRole={copy.evidenceRole} replicationRole={copy.replicationRole} />
                </section>
                <section data-step="response" data-missing={isEvidenceAction && !record.responseBody || undefined}>
                  <h4>{copy.response}</h4>
                  <p>{record.responseBody ?? (isEvidenceAction ? copy.responseMissing : judgment)}</p>
                  {record.responseRef && <><a href={refUrl(record.responseRef)} target="_blank" rel="noopener noreferrer">{copy.openRef} ↗</a><code>{record.responseRef}</code></>}
                  <EvidenceLine title={copy.responseEvidence} evidence={record.responseEvidence} missing={copy.evidenceMissing} evidenceRole={copy.evidenceRole} replicationRole={copy.replicationRole} />
                </section>
                {isEvidenceAction && (
                  <section data-step="test" data-missing={!record.responseTest || undefined}>
                    <h4>{copy.discriminatingTest}</h4>
                    <p>{record.responseTest ?? copy.testMissing}</p>
                  </section>
                )}
                {record.action === 'refute' && (
                  <ReturnFalsifiedControl path={path} record={record} copy={copy} actor={actor} onResponseRecorded={onResponseRecorded} />
                )}
              </li>
            );
          })}
        </ol>
      ) : <p className="fi-connection-dossier-empty">{copy.targetMissing}</p>}
    </section>
  );
}

function responseError(copy: typeof COPY.zh | typeof COPY.en, code: string | undefined, status: number): string {
  if (status === 0) return copy.errorNetwork;
  if (code === 'denied') return copy.errorDenied;
  if (code === 'evidence_required') return copy.errorEvidence;
  if (code === 'target_required' || code === 'target_unanchored') return copy.errorTarget;
  if (code === 'same_island') return copy.errorSameIsland;
  if (code === 'not_falsified') return copy.errorNotFalsified;
  if (code === 'already_returned') return copy.errorAlreadyReturned;
  return copy.errorGeneric;
}

function ConnectionResponseForm({ path, lang, copy, actor, onResponseRecorded }: {
  path: ConnectionPath;
  lang: 'zh' | 'en';
  copy: typeof COPY.zh | typeof COPY.en;
  actor?: string;
  onResponseRecorded?: (pathId: string) => void;
}) {
  const targets = [...new Map(path.records.map((record) => [record.targetRef, record])).values()];
  const [targetRef, setTargetRef] = useState(targets[0]?.targetRef ?? '');
  const [action, setAction] = useState<'validate' | 'refute'>(path.kind === 'contradiction' ? 'refute' : 'validate');
  const [body, setBody] = useState('');
  const [test, setTest] = useState('');
  const [roCrate, setRoCrate] = useState('');
  const [hash, setHash] = useState('');
  const [role, setRole] = useState<'evidence' | 'replication'>('replication');
  const [state, setState] = useState<'idle' | 'saving' | 'success' | 'proposed' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const writeIntro = copy.writeIntro.replace('{{to}}', localized(path.to.title, lang)).replace('{{from}}', localized(path.from.title, lang));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!actor || !targetRef) {
      setState('error');
      setMessage(copy.actorMissing);
      return;
    }
    setState('saving');
    setMessage('');
    const outcome = await api.respondToConnection(path.to.slug, {
      targetRef,
      action,
      body,
      test,
      evidence: { ro_crate: roCrate.trim(), role, hash: hash.trim() },
      language: lang,
      actor,
    });
    if (!outcome.ok) {
      setState('error');
      setMessage(responseError(copy, outcome.code, outcome.status));
      return;
    }
    const proposed = outcome.value.degraded;
    setState(proposed ? 'proposed' : 'success');
    setMessage(proposed ? copy.responseProposed : copy.responseSaved);
    if (!proposed) {
      setBody('');
      setTest('');
      setRoCrate('');
      setHash('');
    }
    const nextKind = action === 'refute' ? 'contradiction' : 'evidence';
    const nextSign = action === 'refute' ? 'contest' : 'affirm';
    onResponseRecorded?.(proposed ? path.id : `ledger:${nextKind}:${path.from.slug}:${path.to.slug}:${nextSign}`);
  };

  return (
    <section className="fi-connection-response-shell">
      <p className="fi-connection-compact-write-note">{copy.desktopWrite}</p>
      <details className="fi-connection-response">
        <summary><span aria-hidden="true">＋</span><strong>{copy.writeResponse}</strong><small>{writeIntro}</small></summary>
        <form onSubmit={submit}>
          {targets.length > 1 ? (
            <label><span>{copy.target}</span><select value={targetRef} onChange={(event) => setTargetRef(event.target.value)}>{targets.map((record) => <option key={record.targetRef} value={record.targetRef}>{record.targetSummary ?? record.targetRef}</option>)}</select></label>
          ) : <p className="fi-connection-response-target"><strong>{copy.target}</strong><span>{targets[0]?.targetSummary ?? copy.targetMissing}</span><code>{targetRef}</code></p>}
          <fieldset>
            <legend>{copy.position}</legend>
            <label><input type="radio" name="connection-response-action" value="validate" checked={action === 'validate'} onChange={() => setAction('validate')} /><span>→ {path.kind === 'bridge' ? copy.bridgeValidate : copy.validate}</span></label>
            <label><input type="radio" name="connection-response-action" value="refute" checked={action === 'refute'} onChange={() => setAction('refute')} /><span>⊣ {path.kind === 'bridge' ? copy.bridgeRefute : copy.refute}</span></label>
          </fieldset>
          <label><span>{copy.argument}</span><textarea required maxLength={1800} rows={5} value={body} onChange={(event) => setBody(event.target.value)} placeholder={copy.argumentHint} /></label>
          <label><span>{copy.test}</span><textarea required maxLength={1200} rows={4} value={test} onChange={(event) => setTest(event.target.value)} placeholder={copy.testHint} /></label>
          <div className="fi-connection-response-evidence-fields">
            <label><span>{copy.crate}</span><input required type="url" value={roCrate} onChange={(event) => setRoCrate(event.target.value)} placeholder="https://…/ro-crate" /></label>
            <label><span>{copy.hash}</span><input required type="text" pattern="sha256:[0-9a-f]{64}" value={hash} onChange={(event) => setHash(event.target.value)} placeholder="sha256:…" /></label>
            <label><span>{copy.role}</span><select value={role} onChange={(event) => setRole(event.target.value as 'evidence' | 'replication')}><option value="evidence">{copy.evidenceRole}</option><option value="replication">{copy.replicationRole}</option></select></label>
          </div>
          <footer>
            <small>{handleOf(actor ?? '—')} · {localized(path.to.title, lang)} → Workshop</small>
            <button type="submit" disabled={state === 'saving' || !actor}>{state === 'saving' ? copy.saving : copy.submitResponse}</button>
          </footer>
          {message && <p className="fi-connection-response-status" data-state={state} role={state === 'error' ? 'alert' : 'status'}>{message}</p>}
        </form>
      </details>
    </section>
  );
}

function ProblemDetail({ problem, field, lang, copy, onFocus, onEnter }: {
  problem: ConnectionProblem;
  field: ConnectionField;
  lang: 'zh' | 'en';
  copy: typeof COPY.zh | typeof COPY.en;
  onFocus: (focus: ConnectionFocus) => void;
  onEnter: (problem: ConnectionProblem) => void;
}) {
  const groups = field.convergences.filter((group) => group.members.some((member) => member.problem.slug === problem.slug));
  const paths = field.paths.filter((path) => path.from.slug === problem.slug || path.to.slug === problem.slug);
  return (
    <article className="fi-connection-detail fi-connection-problem">
      <header><span><small>{problem.domain}</small><h2>{localized(problem.title, lang)}</h2><p>{localized(problem.question, lang)}</p></span></header>
      {problem.brief && <p className="fi-connection-intro">{localized(problem.brief, lang)}</p>}
      <button type="button" className="fi-connection-open-problem" onClick={() => onEnter(problem)}>{copy.view}</button>
      <h3>{copy.focusProblem} · {groups.length + paths.length}</h3>
      {groups.length + paths.length === 0 && <p>{copy.noRelations}</p>}
      <div className="fi-connection-problem-links">
        {groups.map((group) => <button type="button" key={group.id} onClick={() => onFocus({ type: 'convergence', id: group.id })}><RelationMark kind="mechanism" /><span>{localized(group.title, lang)}<small>{localized(group.sharedCore, lang)}</small></span></button>)}
        {paths.map((path) => <button type="button" key={path.id} onClick={() => onFocus({ type: 'path', id: path.id })}><RelationMark kind={path.kind} /><span>{localized(path.label, lang)}<small>{localized(path.from.slug === problem.slug ? path.to.title : path.from.title, lang)}</small></span></button>)}
      </div>
    </article>
  );
}
