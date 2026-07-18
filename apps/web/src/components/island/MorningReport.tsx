import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { StationKind } from '@frontier-isles/core';
import { api, type MorningReportDraft } from '../../api/client';
import { BRIEF, SAMPLE_SLUG } from '../../api/fallback';
import { localizeStation, localizeStationZh, type Lang } from '../../i18n/stations';

export type BriefState = 'pending' | 'ok' | 'back';

export interface MorningReportProps {
  /** Ledger actor id for the adopt/return HITL decision (§5 capability gateway). */
  actor: string;
  /** Best-effort toast on a failed write (network absent / gateway denial) — optional. */
  onToast?: (msg: string) => void;
}

interface DisplayDraft {
  refHash: string;
  title: string;
  destLabel: string;
}

/**
 * 晨报 · morning report — the dawn HITL adopt/return chain (day only).
 *
 * Fetches last night's real dock drafts (`api.morningReport`, reduced from
 * the ledger by `@frontier-isles/core`'s `projectMorningReport`) on mount.
 * Per the build-spec resilience rule the UI must render identically with the
 * server absent: on any fetch failure it falls back to the static `BRIEF`
 * seed, exactly as before. Adopt/return post a real `adopt` /
 * `return_to_driftwood` event keyed by the draft's own content-addressed
 * ref — never by array position — so a reload can never mis-resolve a
 * shifted index. A resolved draft's status is optimistic (kept visible with
 * a checkmark for the rest of this session); on the next reload the server
 * simply omits it (it left the inbox for its destination or driftwood), so
 * status is never silently reset to "pending" behind the user's back.
 */
export function MorningReport({ actor, onToast }: MorningReportProps) {
  const { t, i18n } = useTranslation();
  const lang: Lang = i18n.language === 'en' ? 'en' : 'zh';

  const [source, setSource] = useState<'loading' | 'api' | 'fallback'>('loading');
  const [apiDrafts, setApiDrafts] = useState<MorningReportDraft[]>([]);
  const [decided, setDecided] = useState<Record<string, BriefState>>({});

  useEffect(() => {
    let alive = true;
    void (async () => {
      const res = await api.morningReport(SAMPLE_SLUG);
      if (!alive) return;
      if (res) {
        setApiDrafts(res.drafts);
        setSource('api');
      } else {
        setSource('fallback');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const items: DisplayDraft[] = useMemo(() => {
    if (source === 'api') {
      return apiDrafts.map((d) => ({
        refHash: d.refHash,
        title: d.title,
        destLabel: d.dest ? localizeStation(d.dest as StationKind, lang) : '',
      }));
    }
    // 'loading' renders the same static seed as 'fallback' so the panel never
    // flashes empty — offline and pre-fetch render identically (build-spec rule).
    return BRIEF.map((b, i) => ({
      refHash: `fallback:${i}`,
      title: b.t[lang],
      destLabel: localizeStationZh(b.d, lang),
    }));
  }, [source, apiDrafts, lang]);

  async function decide(refHash: string, decision: 'adopt' | 'return') {
    const optimistic: BriefState = decision === 'adopt' ? 'ok' : 'back';
    setDecided((prev) => ({ ...prev, [refHash]: optimistic }));
    if (source !== 'api') return; // demo/offline mode — local-only, matches fallback rendering rule
    const res = await api.decideBrief(SAMPLE_SLUG, refHash, decision, actor);
    if (!res) {
      setDecided((prev) => ({ ...prev, [refHash]: 'pending' }));
      onToast?.(t('toast.morningFailed'));
    }
  }

  return (
    <div style={{ position: 'absolute', right: 20, top: 140, width: 278, background: 'var(--card,rgba(250,245,232,0.94))', border: '1.5px solid var(--ink,#3A342B)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px 8px', borderBottom: '0.75px solid var(--ink2,#6B6154)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span aria-hidden="true" style={{ width: 22, height: 22, borderRadius: 3, background: '#2E5E8C', color: '#F6F2E6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Serif SC',serif", fontSize: 12 }}>{t('island.morning.seal')}</span>
        <span style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 700, fontSize: 13, color: 'var(--inkT,#2B2620)' }}>{t('island.morning.title')}</span>
        <span style={{ marginLeft: 'auto', fontSize: 9, padding: '1.5px 7px', borderRadius: 999, border: '1px solid rgba(90,108,158,0.6)', color: '#5A6C9E' }}>{t('island.morning.badge')}</span>
      </div>
      {items.length === 0 && (
        <div style={{ padding: '12px 14px', fontSize: 11, color: 'var(--ink2,#6B6154)' }}>{t('island.morning.empty')}</div>
      )}
      {items.map((b) => {
        const st = decided[b.refHash] ?? 'pending';
        return (
          <div key={b.refHash} style={{ padding: '9px 14px', borderBottom: '0.75px solid rgba(107,97,84,0.25)' }}>
            <div style={{ fontSize: 12, color: 'var(--inkT,#2B2620)', lineHeight: 1.5 }}>{b.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <span style={{ fontSize: 9.5, color: 'var(--ink2,#6B6154)' }}>{t('island.morning.dest', { dest: b.destLabel })}</span>
              <span style={{ flex: 1 }} />
              {st === 'pending' && (
                <>
                  <button type="button" className="fi-hit" onClick={() => void decide(b.refHash, 'adopt')} style={{ cursor: 'pointer', fontSize: 10.5, padding: '2.5px 10px', border: 0, borderRadius: 5, background: '#3E9B7E', color: '#F6F2E6', userSelect: 'none' }}>{t('island.morning.adopt')}</button>
                  <button type="button" className="fi-hit" onClick={() => void decide(b.refHash, 'return')} style={{ cursor: 'pointer', fontSize: 10.5, padding: '2.5px 10px', borderRadius: 5, background: 'transparent', border: '1px solid var(--ink2,#6B6154)', color: 'var(--ink2,#6B6154)', userSelect: 'none' }}>{t('island.morning.return')}</button>
                </>
              )}
              {st === 'ok' && <span style={{ fontSize: 10.5, color: '#2B7A5F' }}>{t('island.morning.adopted')}</span>}
              {st === 'back' && <span style={{ fontSize: 10.5, color: '#8C8270' }}>{t('island.morning.returned')}</span>}
            </div>
          </div>
        );
      })}
      <div style={{ padding: '7px 14px', fontSize: 9.5, color: 'var(--ink2,#6B6154)', fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>{t('island.morning.footer')}</div>
    </div>
  );
}
