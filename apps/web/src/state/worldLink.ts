/**
 * Shareable world locations — the URL hash is a readable twin of "where am I".
 *
 * `#island=<slug>` marks a docked L1 island; an empty hash is the L0 atlas.
 * Personal truths (notebook, model runs, craft pose) never enter the URL:
 * a shared link must reproduce a public place, not a private session.
 */

export interface WorldLink {
  /** Docked island slug, or null for the L0 atlas. */
  island: string | null;
}

/** Longest slug the parser accepts; anything beyond is treated as noise. */
const MAX_SLUG_LENGTH = 120;

export function parseWorldLink(hash: string): WorldLink {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!raw) return { island: null };
  let slug: string | null = null;
  try {
    slug = new URLSearchParams(raw).get('island');
  } catch {
    slug = null;
  }
  if (!slug || slug.length > MAX_SLUG_LENGTH) return { island: null };
  return { island: slug };
}

export function formatWorldLink(link: WorldLink): string {
  if (!link.island) return '';
  const params = new URLSearchParams();
  params.set('island', link.island);
  return `#${params.toString()}`;
}
