import { useTranslation } from 'react-i18next';
import type { IslandDatum } from '../../api/fallback';

export interface IslandStepperProps {
  prev: IslandDatum | null;
  next: IslandDatum | null;
  onStep: (direction: -1 | 1) => void;
  /** Suppresses double-fires while a voyage transition is running. */
  disabled?: boolean;
  /** Announced politely on arrival so keyboard stepping is never silent. */
  currentName?: string;
}

/**
 * ‹ › island stepping in the L1 hud. The order is the atlas roster — the
 * exact order the list twin reads — so stepping is navigation, never rank.
 */
export function IslandStepper({ prev, next, onStep, disabled, currentName }: IslandStepperProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'zh';
  if (!prev && !next) return null;
  return (
    <nav className="fi-island-stepper" aria-label={t('island.step.label')}>
      <button
        type="button"
        className="fi-hit"
        disabled={disabled || !prev}
        onClick={() => onStep(-1)}
        aria-label={prev ? t('island.step.prevNamed', { name: prev.n[lang] }) : t('island.step.prev')}
      >
        <span aria-hidden="true">‹</span>
        <small>{prev?.n[lang] ?? ''}</small>
      </button>
      <button
        type="button"
        className="fi-hit"
        disabled={disabled || !next}
        onClick={() => onStep(1)}
        aria-label={next ? t('island.step.nextNamed', { name: next.n[lang] }) : t('island.step.next')}
      >
        <small>{next?.n[lang] ?? ''}</small>
        <span aria-hidden="true">›</span>
      </button>
      {currentName && <span className="sr-only" role="status">{currentName}</span>}
    </nav>
  );
}
