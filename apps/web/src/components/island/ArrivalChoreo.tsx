import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { ArrivalStage } from '../../scene/arrival';

export interface ArrivalChoreoProps {
  stages: readonly ArrivalStage[];
  phase: number;
  /** Advances one beat; the parent owns the phase so it can gate scene props. */
  onAdvance: (next: number) => void;
  reducedMotion: boolean;
  lang: 'zh' | 'en';
}

/** Milliseconds per arrival beat (~2.5s for a typical five-beat island). */
const BEAT_MS = 430;

/**
 * The paper-mist veil and stage captions of an island arrival. Runs the beat
 * timer while phases remain, skips to done on any input (the world stays
 * interactive underneath — the veil never intercepts a pointer), and renders
 * nothing once the island has fully materialised. Reduced motion never mounts
 * this component's veil: the parent computes `done` directly.
 */
export function ArrivalChoreo({ stages, phase, onAdvance, reducedMotion, lang }: ArrivalChoreoProps) {
  const { t } = useTranslation();
  const total = stages.length;
  const running = !reducedMotion && phase < total;

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => onAdvance(phase + 1), BEAT_MS);
    return () => window.clearTimeout(id);
  }, [onAdvance, phase, running]);

  // Any input ends the ceremony immediately — arrival narrates, never blocks.
  useEffect(() => {
    if (!running) return;
    const skip = () => onAdvance(total);
    window.addEventListener('pointerdown', skip, true);
    window.addEventListener('keydown', skip, true);
    return () => {
      window.removeEventListener('pointerdown', skip, true);
      window.removeEventListener('keydown', skip, true);
    };
  }, [onAdvance, running, total]);

  if (!running) return null;
  const stage = stages[Math.min(phase, total - 1)];
  const caption = !stage
    ? ''
    : stage.kind === 'terrain'
      ? t('island.arrival.terrain')
      : stage.kind === 'district'
        ? t('island.arrival.district', { name: stage.name[lang] })
        : stage.kind === 'claims'
          ? t('island.arrival.claims')
          : t('island.arrival.lamps');

  return (
    <>
      <div
        className="fi-arrival-veil"
        aria-hidden="true"
        style={{ opacity: Math.max(0, (1 - phase / total)) * 0.88 }}
      />
      <div className="fi-arrival-caption" role="status">
        <i aria-hidden="true" />
        <span>{caption}</span>
      </div>
    </>
  );
}
