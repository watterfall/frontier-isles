import { describe, expect, it } from 'vitest';
import {
  canonicalStringifyXFrontierFeedbackRequest,
  diffXFrontierFeedbackReadStates,
  hashXFrontierFeedbackRequest,
  normalizeXFrontierFeedbackReadState,
  normalizeXFrontierFindingsResponse,
  normalizeXFrontierProposalsPage,
  toXFrontierFeedbackStrongToolIntent,
  toXFrontierFeedbackToolIntent,
  validateXFrontierFeedbackEnvelope,
  XFRONTIER_FEEDBACK_SCHEMA_VERSION,
  XFRONTIER_FEEDBACK_SCHEMA_VERSION_V2,
} from '../src/xfrontier-feedback';

const REF_HASH = `sha256:${'a'.repeat(64)}`;
const CONTENT_HASH = 'abc12345';

const baseEnvelope = (payload: Record<string, unknown>) => ({
  schemaVersion: XFRONTIER_FEEDBACK_SCHEMA_VERSION,
  idempotencyKey: 'frontier-isles:ledger:event-001',
  source: {
    system: 'frontier-isles',
    ledgerRef: 'ledger://island/example/event-001',
    evidence: 'Reproduced by the named local test and attached artifact.',
    refHash: REF_HASH,
  },
  target: { datasetVersion: 'xf-current123' },
  payload,
});

const strongEnvelope = (
  payload: Record<string, unknown>,
  expectedContentHash: string | null = CONTENT_HASH,
) => ({
  ...baseEnvelope(payload),
  schemaVersion: XFRONTIER_FEEDBACK_SCHEMA_VERSION_V2,
  target: {
    datasetVersion: 'xf-current123',
    ...(expectedContentHash === null ? {} : { expectedContentHash }),
  },
});

const findingResponse = (items: unknown[] = []) => ({
  dataset_version: 'xf-current123',
  total: items.length,
  stale_count: 0,
  items,
});

const proposal = ({
  id = 'proposal-1',
  status = 'pending',
  decisions = [],
  humanReviewed = false,
}: {
  id?: string;
  status?: 'pending' | 'accepted' | 'rejected';
  decisions?: unknown[];
  humanReviewed?: boolean;
} = {}) => ({
  kind: 'proposal',
  id,
  proposal_kind: 'annotation',
  record_id: 40,
  field: 'mech',
  value: 'A local mechanism statement',
  rationale: 'The record states the quantities explicitly.',
  confidence: 0.8,
  by: 'frontier-isles',
  by_type: 'model',
  dataset_version: 'xf-current123',
  timestamp: '2026-08-12T10:00:00.000Z',
  status,
  decisions,
  human_reviewed: humanReviewed,
});

const proposalsPage = (items: unknown[], overrides: Record<string, unknown> = {}) => ({
  dataset_version: 'xf-current123',
  total: items.length,
  offset: 0,
  items,
  conflicts: [],
  nextCursor: null,
  ...overrides,
});

describe('xFrontier feedback envelope', () => {
  it('strictly validates and maps all three feedback kinds to inert MCP intents', () => {
    const finding = toXFrontierFeedbackToolIntent(baseEnvelope({
      kind: 'finding',
      scale: 'population',
      predicate: 's[6] < 3',
      n: 380,
      findingKind: 'excluded-subset',
      statement: 'The downstream gate excludes this reproducible subset.',
      by: 'frontier-isles',
      filedBy: null,
    }), 'xf-current123');
    expect(finding).toEqual({
      toolName: 'report_finding',
      arguments: {
        scale: 'population',
        kind: 'excluded-subset',
        statement: 'The downstream gate excludes this reproducible subset.',
        evidence: 'Reproduced by the named local test and attached artifact.',
        by: 'frontier-isles',
        filed_by: null,
        predicate: 's[6] < 3',
        n: 380,
      },
      idempotencyKey: 'frontier-isles:ledger:event-001',
      source: {
        system: 'frontier-isles',
        ledgerRef: 'ledger://island/example/event-001',
        evidence: 'Reproduced by the named local test and attached artifact.',
        refHash: REF_HASH,
      },
      targetDatasetVersion: 'xf-current123',
      remoteIdempotency: 'unsupported',
      requiresExplicitSubmission: true,
    });
    expect('execute' in finding).toBe(false);

    const annotation = toXFrontierFeedbackToolIntent(baseEnvelope({
      kind: 'annotation', recordId: 40, field: 'mech', value: 'local mechanism',
      rationale: 'Grounded in the record text.', confidence: 0.8, by: 'frontier-isles',
    }), 'xf-current123');
    expect(annotation).toMatchObject({
      toolName: 'propose_annotation',
      arguments: { record_id: 40, field: 'mech', value: 'local mechanism', confidence: 0.8 },
    });

    const link = toXFrontierFeedbackToolIntent(baseEnvelope({
      kind: 'structure_link', recordId: 40, structureId: '  iso-03  ',
      rationale: 'The shared skeleton survives the boundary check.', confidence: 0.7, by: 'frontier-isles',
    }), 'xf-current123');
    expect(link).toMatchObject({
      toolName: 'propose_structure_link',
      arguments: {
        record_id: 40,
        structure_id: 'ISO-03',
        evidence: 'Reproduced by the named local test and attached artifact.',
      },
    });
  });

  it('matches xFrontier trim+uppercase normalization before hashing structure links', () => {
    const intent = toXFrontierFeedbackStrongToolIntent(strongEnvelope({
      kind: 'structure_link', recordId: 40, structureId: '  iso-03  ',
      rationale: 'The shared skeleton survives the boundary check.', confidence: 0.7, by: 'frontier-isles',
    }), 'xf-current123');
    expect(intent.arguments.structure_id).toBe('ISO-03');
    expect(intent.requestHash).toBe('sha256:26de74752e560f5365450c5b2ae1cf00ad853d8f8a1a108af5f22d27c29483d0');
    expect(() => validateXFrontierFeedbackEnvelope(strongEnvelope({
      kind: 'structure_link', recordId: 40, structureId: '   ',
      rationale: 'why', confidence: 0.7, by: 'frontier-isles',
    }))).toThrow('must contain a non-whitespace structure id');
  });

  it('rejects extra authority claims, malformed scopes, and stale dataset targets', () => {
    expect(() => validateXFrontierFeedbackEnvelope({
      ...baseEnvelope({
        kind: 'annotation', recordId: 40, field: 'mech', value: 'x', rationale: 'why', confidence: 0.5, by: 'model',
        by_type: 'human',
      }),
    })).toThrow('$.payload.by_type: is not allowed');
    expect(() => validateXFrontierFeedbackEnvelope(baseEnvelope({
      kind: 'finding', scale: 'population', predicate: 's[6] < 3',
      findingKind: 'excluded-subset', statement: 'x', by: 'model', filedBy: null,
    }))).toThrow('$.payload.n: is required');
    expect(() => toXFrontierFeedbackToolIntent(baseEnvelope({
      kind: 'annotation', recordId: 40, field: 'mech', value: 'x', rationale: 'why', confidence: 0.5, by: 'model',
    }), 'xf-newer456')).toThrow('targets xf-current123, current MCP dataset is xf-newer456');
    const withoutHash = baseEnvelope({
      kind: 'annotation', recordId: 40, field: 'mech', value: 'x', rationale: 'why', confidence: 0.5, by: 'model',
    });
    const { refHash: _refHash, ...source } = withoutHash.source;
    expect(() => validateXFrontierFeedbackEnvelope({ ...withoutHash, source }))
      .toThrow('needs ledgerEventHash or refHash as a durable local evidence anchor');
    expect(() => validateXFrontierFeedbackEnvelope({
      ...withoutHash,
      source: { ...withoutHash.source, refHash: `sha256:${'A'.repeat(64)}` },
    })).toThrow('$.source.refHash: does not match');
  });

  it('maps v2 proposals to one canonical conditional/idempotent wire request', () => {
    const intent = toXFrontierFeedbackStrongToolIntent(strongEnvelope({
      kind: 'annotation', recordId: 40, field: 'mech', value: 'local mechanism',
      rationale: 'Grounded in the record text.', confidence: 0.8, by: 'frontier-isles',
    }), 'xf-current123');
    expect(intent).toMatchObject({
      toolName: 'propose_annotation',
      idempotencyKey: 'frontier-isles:ledger:event-001',
      clientEventId: 'frontier-isles:ledger:event-001',
      targetDatasetVersion: 'xf-current123',
      targetContentHash: CONTENT_HASH,
      remoteIdempotency: 'client-event-id',
      receiptLookup: true,
      requiresExplicitSubmission: true,
      arguments: {
        record_id: 40,
        field: 'mech',
        value: 'local mechanism',
        rationale: 'Grounded in the record text.',
        confidence: 0.8,
        by: 'frontier-isles',
        client_event_id: 'frontier-isles:ledger:event-001',
        expected_dataset_version: 'xf-current123',
        expected_content_hash: CONTENT_HASH,
      },
    });
    const canonical = '{"arguments":{"by":"frontier-isles","client_event_id":"frontier-isles:ledger:event-001","confidence":0.8,"expected_content_hash":"abc12345","expected_dataset_version":"xf-current123","field":"mech","rationale":"Grounded in the record text.","record_id":40,"value":"local mechanism"},"tool_name":"propose_annotation"}';
    expect(canonicalStringifyXFrontierFeedbackRequest(intent.toolName, intent.arguments)).toBe(canonical);
    expect(intent.requestHash).toBe(hashXFrontierFeedbackRequest(intent.toolName, intent.arguments));
    expect(intent.requestHash).toBe('sha256:ff6de02f384d9af39f212ccaf3e1a9d19b7d89b3c25ea3573beea58681a872c5');
  });

  it('sorts canonical request objects recursively without reordering arrays', () => {
    expect(canonicalStringifyXFrontierFeedbackRequest('report_finding', {
      z: [{ b: 2, a: 1 }, 3],
      a: null,
    })).toBe('{"arguments":{"a":null,"z":[{"a":1,"b":2},3]},"tool_name":"report_finding"}');
  });

  it('keeps v1 readable but refuses it at the strong-write boundary', () => {
    const legacy = baseEnvelope({
      kind: 'annotation', recordId: 40, field: 'mech', value: 'x',
      rationale: 'why', confidence: 0.5, by: 'frontier-isles',
    });
    expect(toXFrontierFeedbackToolIntent(legacy, 'xf-current123')).toMatchObject({
      remoteIdempotency: 'unsupported',
    });
    expect(() => toXFrontierFeedbackStrongToolIntent(legacy, 'xf-current123'))
      .toThrow('xfrontier-feedback-envelope/v1 cannot authorize a strong write');
  });

  it('requires proposal content hashes and forbids them on field/population findings', () => {
    const annotation = {
      kind: 'annotation', recordId: 40, field: 'mech', value: 'x',
      rationale: 'why', confidence: 0.5, by: 'frontier-isles',
    };
    const proposalWithoutHash = {
      ...strongEnvelope(annotation),
      target: { datasetVersion: 'xf-current123' },
    };
    expect(() => validateXFrontierFeedbackEnvelope(proposalWithoutHash))
      .toThrow('$.target.expectedContentHash: is required');
    expect(() => validateXFrontierFeedbackEnvelope(strongEnvelope(annotation, 'ABC12345')))
      .toThrow('$.target.expectedContentHash: does not match');

    const fieldFinding = strongEnvelope({
      kind: 'finding', scale: 'field', field: 'mech', findingKind: 'semantic-warning',
      statement: 'The field is derived.', by: 'frontier-isles', filedBy: null,
    });
    expect(() => validateXFrontierFeedbackEnvelope(fieldFinding))
      .toThrow('$.target.expectedContentHash: is not allowed for field findings');
    const populationFinding = strongEnvelope({
      kind: 'finding', scale: 'population', predicate: 's[0] < 2', n: 4,
      findingKind: 'excluded-subset', statement: 'A bounded subset.',
      by: 'frontier-isles', filedBy: null,
    });
    expect(() => validateXFrontierFeedbackEnvelope(populationFinding))
      .toThrow('$.target.expectedContentHash: is not allowed for population findings');

    const recordFinding = toXFrontierFeedbackStrongToolIntent(strongEnvelope({
      kind: 'finding', scale: 'record', recordId: 40, findingKind: 'semantic-warning',
      statement: 'A record-scoped observation.', by: 'frontier-isles', filedBy: null,
    }, null), 'xf-current123');
    expect(recordFinding.arguments).not.toHaveProperty('expected_content_hash');
    expect(recordFinding).not.toHaveProperty('targetContentHash');
  });
});

describe('xFrontier read-only feedback normalization', () => {
  it('normalizes findings while preserving legacy filer absence distinctly from null', () => {
    const legacy = {
      kind: 'finding', id: 'finding-1', finding_kind: 'stale-reference',
      scope: { scale: 'record', record_id: 1449, xf: 'XF-001449', record_status: 'withdrawn' },
      statement: 'A consumer still references the retired record.', evidence: 'resolve_ids result',
      by: 'frontier-isles', by_type: 'model', observed_at_dataset_version: 'xf-current123',
      timestamp: '2026-08-12T10:00:00.000Z', stale: false, filed_by_recorded: false,
    };
    const normalized = normalizeXFrontierFindingsResponse({
      ...findingResponse([legacy]),
      store: '/local/ledger',
      note: 'Current live response metadata is accepted explicitly.',
    });
    expect(normalized.items[0]).toMatchObject({
      id: 'finding-1',
      scope: { scale: 'record', recordId: 1449, recordStatus: 'withdrawn' },
      filedByRecorded: false,
    });
    expect('filedBy' in normalized.items[0]!).toBe(false);
    expect(() => normalizeXFrontierFindingsResponse(findingResponse([{ ...legacy, stale: true }])))
      .toThrow('$.items[0].stale: is inconsistent with dataset versions');
    expect(() => normalizeXFrontierFindingsResponse(findingResponse([{ ...legacy, typo: true }])))
      .toThrow('$.items[0].typo: is not allowed');
  });

  it('preserves complete decision ids/history and never derives a local disposition', () => {
    const decision = {
      kind: 'decision', id: 'decision-1', proposal_id: 'proposal-1', decision: 'accepted',
      rationale: 'Checked by a person.', by: 'Ji Li', by_type: 'human',
      dataset_version: 'xf-current123', timestamp: '2026-08-12T11:00:00.000Z',
    };
    const page = normalizeXFrontierProposalsPage({
      ...proposalsPage([proposal({ status: 'accepted', decisions: [decision], humanReviewed: true })]),
      store: '/local/ledger',
      review: 'Human CLI only.',
    });
    expect(page.items[0]).toMatchObject({
      remoteStatus: 'accepted',
      humanReviewed: true,
      localDisposition: null,
      decisionHistory: [{ id: 'decision-1', proposalId: 'proposal-1', byType: 'human' }],
    });
    expect(() => normalizeXFrontierProposalsPage(proposalsPage([
      proposal({ status: 'accepted', decisions: [decision], humanReviewed: false }),
    ]))).toThrow('$.items[0].human_reviewed: is inconsistent with decision history');
  });

  it('normalizes mixed legacy and 0.6 records while preserving paired request identity', () => {
    const legacyFinding = {
      kind: 'finding', id: 'finding-legacy', finding_kind: 'stale-reference',
      scope: { scale: 'record', record_id: 1449, xf: 'XF-001449', record_status: 'withdrawn' },
      statement: 'Legacy observation.', evidence: 'Legacy evidence.',
      by: 'frontier-isles', by_type: 'model', observed_at_dataset_version: 'xf-current123',
      timestamp: '2026-08-12T10:00:00.000Z', stale: false, filed_by_recorded: false,
    };
    const strongFinding = {
      ...legacyFinding,
      id: 'finding-strong',
      client_event_id: 'frontier-isles:ledger:event-002',
      request_hash: `sha256:${'b'.repeat(64)}`,
    };
    const findings = normalizeXFrontierFindingsResponse(findingResponse([legacyFinding, strongFinding]));
    expect(findings.items[0]).not.toHaveProperty('clientEventId');
    expect(findings.items[1]).toMatchObject({
      clientEventId: 'frontier-isles:ledger:event-002',
      requestHash: `sha256:${'b'.repeat(64)}`,
    });

    const proposals = normalizeXFrontierProposalsPage(proposalsPage([
      proposal({ id: 'proposal-legacy' }),
      {
        ...proposal({ id: 'proposal-strong' }),
        client_event_id: 'frontier-isles:ledger:event-003',
        request_hash: `sha256:${'c'.repeat(64)}`,
      },
    ]));
    expect(proposals.items[0]).not.toHaveProperty('requestHash');
    expect(proposals.items[1]).toMatchObject({
      clientEventId: 'frontier-isles:ledger:event-003',
      requestHash: `sha256:${'c'.repeat(64)}`,
    });
  });

  it('refuses partial or malformed 0.6 request identity metadata', () => {
    const legacyFinding = {
      kind: 'finding', id: 'finding-1', finding_kind: 'stale-reference',
      scope: { scale: 'record', record_id: 1449, xf: 'XF-001449', record_status: 'withdrawn' },
      statement: 'Observation.', evidence: 'Evidence.', by: 'frontier-isles', by_type: 'model',
      observed_at_dataset_version: 'xf-current123', timestamp: '2026-08-12T10:00:00.000Z',
      stale: false, filed_by_recorded: false,
    };
    expect(() => normalizeXFrontierFindingsResponse(findingResponse([{
      ...legacyFinding,
      client_event_id: 'frontier-isles:ledger:event-002',
    }]))).toThrow('$.items[0].request_hash: must be present together');
    expect(() => normalizeXFrontierProposalsPage(proposalsPage([{
      ...proposal(),
      client_event_id: 'frontier-isles:ledger:event-003',
      request_hash: `sha256:${'G'.repeat(64)}`,
    }]))).toThrow('$.items[0].request_hash: does not match');
  });

  it('requires complete contiguous proposal pagination before building a diffable state', () => {
    expect(() => normalizeXFrontierFeedbackReadState({
      findingsResponse: findingResponse(),
      proposalResponses: [proposalsPage([proposal()], { total: 2, nextCursor: 'next' })],
    })).toThrow('proposalResponses[last].nextCursor: must be null for a complete snapshot');

    const state = normalizeXFrontierFeedbackReadState({
      findingsResponse: findingResponse(),
      proposalResponses: [
        proposalsPage([proposal({ id: 'proposal-1' })], { total: 2, nextCursor: 'next' }),
        proposalsPage([proposal({ id: 'proposal-2' })], { total: 2, offset: 1 }),
      ],
    });
    expect(state).toMatchObject({ complete: true, datasetVersion: 'xf-current123' });
    expect(state.proposals.map((item) => item.id)).toEqual(['proposal-1', 'proposal-2']);
  });

  it('diffs remote decisions without turning acceptance into local application', () => {
    const before = normalizeXFrontierFeedbackReadState({
      findingsResponse: findingResponse(),
      proposalResponses: [proposalsPage([proposal()])],
    });
    const decision = {
      kind: 'decision', id: 'decision-1', proposal_id: 'proposal-1', decision: 'accepted',
      rationale: 'Human review complete.', by: 'Ji Li', by_type: 'human',
      dataset_version: 'xf-current123', timestamp: '2026-08-12T11:00:00.000Z',
    };
    const after = normalizeXFrontierFeedbackReadState({
      findingsResponse: findingResponse(),
      proposalResponses: [proposalsPage([
        proposal({ status: 'accepted', decisions: [decision], humanReviewed: true }),
      ])],
    });
    const diff = diffXFrontierFeedbackReadStates(before, after);
    expect(diff.changed).toBe(true);
    expect(diff.proposals.changed).toHaveLength(1);
    expect(diff.proposals.changed[0]).toMatchObject({
      id: 'proposal-1',
      before: { remoteStatus: 'pending', localDisposition: null },
      after: { remoteStatus: 'accepted', localDisposition: null, decisionHistory: [{ id: 'decision-1' }] },
    });
  });
});
