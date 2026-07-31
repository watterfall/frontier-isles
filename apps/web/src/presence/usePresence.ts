import { useEffect, useState } from 'react';
import type { WebsocketProvider } from 'y-websocket';

/**
 * Ephemeral multi-presence via Yjs awareness (architecture.md §5 "Awareness
 * is ephemeral"). Connects to the y-websocket room for an island through the
 * dev proxy `/yjs`. If the server is absent the provider simply keeps
 * retrying in the background and we report 0 remote peers — the UI degrades
 * silently to the static presence figures (build-spec requirement).
 *
 * yjs + y-websocket + lib0 are loaded ONLY when `enabled` first turns true.
 * The hook is called from the eager L0 path but `enabled` is false there
 * (App.tsx gates it on the island view), so a static import would put ~330KB
 * of collaboration runtime in the entry chunk that an atlas visitor never
 * runs. The `import type` above is erased at compile time.
 *
 * @returns the number of REMOTE peers (self excluded), added to the scene's
 *          static presence count by the caller.
 */
export function usePresence(room: string, enabled: boolean): number {
  const [peers, setPeers] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let provider: WebsocketProvider | null = null;
    let doc: { destroy(): void } | null = null;
    // The effect may be torn down while the dynamic import is still in flight;
    // this flag makes that teardown win instead of leaving a live socket.
    let cancelled = false;

    void (async () => {
      try {
        const [Y, { WebsocketProvider }] = await Promise.all([
          import('yjs'),
          import('y-websocket'),
        ]);
        if (cancelled) return;

        const nextDoc = new Y.Doc();
        doc = nextDoc;
        const url = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/yjs`;
        provider = new WebsocketProvider(url, room, nextDoc, { connect: true });
        provider.awareness.setLocalState({ t: Date.now() });
        const update = () => {
          const size = provider?.awareness.getStates().size ?? 1;
          setPeers(Math.max(0, size - 1));
        };
        provider.awareness.on('change', update);
        update();
      } catch {
        /* no server, or the chunk failed to load — stay at 0 */
      }
    })();

    return () => {
      cancelled = true;
      try {
        provider?.awareness.setLocalState(null);
        provider?.destroy();
        doc?.destroy();
      } catch {
        /* ignore */
      }
    };
  }, [room, enabled]);

  return peers;
}
