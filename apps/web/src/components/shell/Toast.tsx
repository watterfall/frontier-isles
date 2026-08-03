export function Toast({ text, on }: { text: string; on: boolean }) {
  return (
    <div
      className="fi-toast"
      data-open={on}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-hidden={!on}
    >
      {text}
    </div>
  );
}
