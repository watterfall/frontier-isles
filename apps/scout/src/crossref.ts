/**
 * CrossRef REST client — the only outbound network in the scout.
 *
 * Politeness (CrossRef "polite pool" norms):
 *   - `mailto` is read from the env (CROSSREF_MAILTO) by the caller; when unset
 *     we omit it and warn once.
 *   - the User-Agent carries the package name + contact.
 *   - requests are spaced ≥ 1s apart and retried once with backoff on failure.
 *
 * `fetchImpl` is injectable so tests drive it from a fixture with zero network.
 */

import { buildCrossRefQuery, type CrossRefWork } from "./pipeline.js";

export const PKG = "@frontier-isles/scout";
export const VERSION = "0.1.0";

export function userAgent(mailto?: string): string {
  const contact = mailto ? `; mailto:${mailto}` : "";
  return `frontier-isles-scout/${VERSION} (+https://github.com/frontier-isles${contact})`;
}

export interface FetchWorksOptions {
  keywords: string[];
  rows: number;
  fromPubDate: string;
  mailto?: string;
  /** Injectable fetch (defaults to global fetch). */
  fetchImpl?: typeof fetch;
  /** Minimum spacing between calls in ms (default 1000; set 0 in tests). */
  minIntervalMs?: number;
  /** Sleeper (injectable; defaults to real setTimeout). */
  sleep?: (ms: number) => Promise<void>;
}

let lastCallAt = 0;

const realSleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Fetch + parse CrossRef `/works`, returning the raw item array. */
export async function fetchWorks(opts: FetchWorksOptions): Promise<CrossRefWork[]> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const sleep = opts.sleep ?? realSleep;
  const minInterval = opts.minIntervalMs ?? 1000;

  // Space requests apart (polite pool).
  const since = Date.now() - lastCallAt;
  if (minInterval > 0 && since < minInterval) await sleep(minInterval - since);

  const { url, headers } = buildCrossRefQuery(opts.keywords, {
    rows: opts.rows,
    fromPubDate: opts.fromPubDate,
    mailto: opts.mailto,
    userAgent: userAgent(opts.mailto),
  });

  const attempt = async (): Promise<CrossRefWork[]> => {
    const res = await fetchImpl(url, { headers });
    if (!res.ok) throw new Error(`CrossRef HTTP ${res.status}`);
    const json = (await res.json()) as { message?: { items?: CrossRefWork[] } };
    return json.message?.items ?? [];
  };

  try {
    return await attempt();
  } catch (err) {
    // One retry with backoff.
    await sleep(Math.max(minInterval, 1000));
    try {
      return await attempt();
    } catch (err2) {
      throw new Error(`CrossRef fetch failed after retry: ${(err2 as Error).message}`);
    }
  } finally {
    lastCallAt = Date.now();
  }
}
