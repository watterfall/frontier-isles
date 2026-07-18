import { forwardRef, useEffect, useRef, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from 'react';

/**
 * Shared modal chrome for the L2 depth panels (ROADMAP §3.13/§3.15 a11y pass).
 * Extracted from the {@link ./island/StationInteriorDrawer!StationInteriorDrawer}
 * contract so the older panels stop re-inventing scrim/close divs: Escape closes,
 * Tab wraps inside the dialog, focus lands on the close button on open and
 * returns to the opener on unmount. Mount the hook only while the panel is open
 * (guard on the outer component, hooks in the inner card) so the focus grab
 * happens on open, not on app load — or, for a panel that stays mounted and
 * animates in/out (QftPanel's sliding scroll), pass its `open` flag so the
 * grab/restore tracks the flag instead of mount/unmount.
 */
export function useDialogChrome<T extends HTMLElement = HTMLDivElement>(onClose: () => void, open = true) {
  const dialogRef = useRef<T | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const priorFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    priorFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(frame);
      priorFocus.current?.focus();
    };
  }, [open]);

  const onDialogKey = (event: ReactKeyboardEvent<HTMLElement>): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) ?? [])].filter((element) => element.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return { dialogRef, closeRef, onDialogKey };
}

export interface PanelScrimProps {
  onClose: () => void;
  /** Accessible name for the scrim's dismiss action (usually t('panel.close')). */
  label: string;
  style?: CSSProperties;
  /** Pass `open ? 0 : -1` for stay-mounted sliding panels so a hidden scrim leaves the tab order. */
  tabIndex?: number;
}

/** Backdrop dismiss surface as a real button (was a bare `div onClick`). */
export function PanelScrim({ onClose, label, style, tabIndex }: PanelScrimProps) {
  return <button type="button" className="fi-panel-scrim" aria-label={label} onClick={onClose} style={style} tabIndex={tabIndex} />;
}

export interface PanelCloseButtonProps {
  onClose: () => void;
  /** Accessible name (usually t('panel.close')). */
  label: string;
  /** Inline styles for the visible glyph box, so each panel keeps its drawn look. */
  boxStyle?: CSSProperties;
  style?: CSSProperties;
  glyph?: string;
}

/** 44px-hit close control whose visible box stays the panel's original small square. */
export const PanelCloseButton = forwardRef<HTMLButtonElement, PanelCloseButtonProps>(
  function PanelCloseButton({ onClose, label, boxStyle, style, glyph = '✕' }, ref) {
    return (
      <button ref={ref} type="button" className="fi-panel-close" aria-label={label} onClick={onClose} style={style}>
        <span aria-hidden="true" style={boxStyle}>{glyph}</span>
      </button>
    );
  },
);
