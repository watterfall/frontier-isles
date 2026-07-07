import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

/**
 * Ephemeral multi-presence via Yjs awareness (architecture.md §5 "Awareness
 * is ephemeral"). Connects to the y-websocket room for an island through the
 * dev proxy `/yjs`. If the server is absent the provider simply keeps
 * retrying in the background and we report 0 remote peers — the UI degrades
 * silently to the static presence figures (build-spec requirement).
 *
 * @returns the number of REMOTE peers (self excluded), added to the scene's
 *          static presence count by the caller.
 */
export function usePresence(room: string, enabled: boolean): number {
  const [peers, setPeers] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let provider: WebsocketProvider | null = null;
    const doc = new Y.Doc();
    try {
      const url = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/yjs`;
      provider = new WebsocketProvider(url, room, doc, { connect: true });
      provider.awareness.setLocalState({ t: Date.now() });
      const update = () => {
        const size = provider?.awareness.getStates().size ?? 1;
        setPeers(Math.max(0, size - 1));
      };
      provider.awareness.on('change', update);
      update();
    } catch {
      /* no server — stay at 0 */
    }
    return () => {
      try {
        provider?.awareness.setLocalState(null);
        provider?.destroy();
        doc.destroy();
      } catch {
        /* ignore */
      }
    };
  }, [room, enabled]);

  return peers;
}
