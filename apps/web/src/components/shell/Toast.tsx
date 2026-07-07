export function Toast({ text, on }: { text: string; on: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#2B2620',
        color: '#F2EAD8',
        fontSize: 12.5,
        padding: '9px 20px',
        borderRadius: 999,
        opacity: on ? 1 : 0,
        transition: 'opacity .4s',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        zIndex: 70,
        fontFamily: "'PingFang SC',sans-serif",
      }}
    >
      {text}
    </div>
  );
}
