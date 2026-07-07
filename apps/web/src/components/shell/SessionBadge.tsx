import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, type ApiMe } from '../../api/client';

const pill: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  background: 'rgba(250,245,232,0.95)',
  border: '1.5px solid #3A342B',
  borderRadius: 999,
  padding: '6px 14px',
  fontSize: 12,
  color: '#2B2620',
  fontFamily: "'PingFang SC',sans-serif",
  boxShadow: '2px 2px 0 rgba(58,48,36,0.12)',
};

/**
 * Session indicator in the shell chrome: shows the ledger identity behind
 * every write, with GitHub sign-in when a session is absent (real OAuth when
 * the server has GITHUB_CLIENT_ID/SECRET; the dev bypass otherwise signs in
 * silently at boot). Offline (fallback mode) it renders nothing — there is
 * no ledger to sign.
 */
export function SessionBadge() {
  const { t } = useTranslation();
  const [me, setMe] = useState<ApiMe | null | 'offline'>('offline');

  useEffect(() => {
    let alive = true;
    // Small delay so the boot-time dev-login (useAppData) has settled first.
    const timer = setTimeout(() => {
      void api.me().then((m) => {
        if (alive) setMe(m);
      });
    }, 1200);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  if (me === 'offline') return null;

  if (me === null) {
    return (
      <a href="/api/auth/github" style={{ ...pill, textDecoration: 'none', cursor: 'pointer' }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="#2B2620" aria-hidden>
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
        </svg>
        {t('session.login')}
      </a>
    );
  }

  return (
    <span style={pill}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3E9B7E' }} />
      <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>{me.handle.replace(/^github:/, '@')}</span>
      <button
        type="button"
        onClick={() => {
          void api.logout().then(() => window.location.reload());
        }}
        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8C8270', fontSize: 11, padding: 0 }}
      >
        {t('session.logout')}
      </button>
    </span>
  );
}
