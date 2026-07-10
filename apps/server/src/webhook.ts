/**
 * Night-digest outbound webhooks (architecture §6 interop: "Slack/Matrix/Feishu
 * webhooks (night digest; the platform is not an IM)").
 *
 * Configuration: `NIGHT_DIGEST_WEBHOOKS` env var = comma-separated URL list.
 * Provider is sniffed from the URL shape — no separate provider config:
 *   - `hooks.slack.com/...`            → Slack incoming-webhook body `{ text }`
 *   - `open.feishu.cn/open-apis/bot/...` → Feishu bot body `{ msg_type: "text", content: { text } }`
 *   - anything else (incl. Matrix via hookshot's generic webhook) → structured JSON
 * Unset/empty → completely silent no-op (zero behavior change, zero network calls).
 *
 * Only ledger events whose `action === "night_digest"` are ever pushed — no
 * other action fires a webhook (§6: "the platform is not an IM"). Delivery is
 * fire-and-forget: it never blocks or fails the ledger write. Each URL gets
 * one retry; if that also fails we `console.warn` and move on.
 *
 * Push bodies only ever contain fields already public on the ledger (actor id,
 * event ref hash, digest text resolved from the ref) — never email/token/session data.
 */

export interface NightDigestRef {
  kind: string;
  content: unknown;
}

export interface NightDigestEventInput {
  islandSlug: string;
  islandName: string;
  actorId: string;
  refHash: string;
  ref: NightDigestRef | undefined;
}

export interface NightDigestMessage {
  islandSlug: string;
  islandName: string;
  islandUrl: string;
  actorId: string;
  refHash: string;
  refShortHash: string;
  digestText: string;
}

export type WebhookProvider = "slack" | "feishu" | "generic";

/** `sha256:abcdef012345...` → `abcdef01` (short, still identifying, fits a chat line). */
function shortHash(refHash: string): string {
  const bare = refHash.includes(":") ? refHash.split(":", 2)[1] : refHash;
  return (bare ?? refHash).slice(0, 8) || "(无 ref)";
}

/** Best-effort human digest text from whatever shape the night_digest event's ref took. */
function extractDigestText(ref: NightDigestRef | undefined): string {
  if (!ref) return "(无摘要)";
  const c = (ref.content ?? {}) as Record<string, unknown>;
  switch (ref.kind) {
    case "morning_report":
    case "note": {
      const title = typeof c.title === "string" ? c.title : undefined;
      const note = typeof c.note === "string" ? c.note : undefined;
      const dest = typeof c.dest === "string" ? c.dest : undefined;
      if (title) return dest ? `${title}(→ ${dest})` : title;
      if (note) return note;
      return "(无摘要)";
    }
    case "driftwood": {
      const atom = typeof c.atom === "string" ? c.atom : "散木";
      const text = typeof c.text === "string" ? c.text : "";
      return text ? `${atom} · ${text}` : atom;
    }
    case "data_ref": {
      const role = typeof c.role === "string" ? c.role : "";
      const roCrate = typeof c.ro_crate === "string" ? c.ro_crate : "";
      return `数据引用 · ${role}${roCrate ? ` · ${roCrate}` : ""}`;
    }
    case "hardware_ref": {
      const role = typeof c.role === "string" ? c.role : "";
      const manifest = typeof c.manifest === "string" ? c.manifest : "";
      return `硬件引用 · ${role}${manifest ? ` · ${manifest}` : ""}`;
    }
    case "dock_proposal": {
      const originalAction = typeof c.originalAction === "string" ? c.originalAction : "?";
      const station = typeof c.station === "string" ? c.station : "dock";
      return `⚓ 未授权推送降级为码头提案 · ${originalAction} → ${station}`;
    }
    default:
      return "(无摘要)";
  }
}

export function buildNightDigestMessage(input: NightDigestEventInput): NightDigestMessage {
  return {
    islandSlug: input.islandSlug,
    islandName: input.islandName,
    islandUrl: `/islands/${input.islandSlug}`,
    actorId: input.actorId,
    refHash: input.refHash,
    refShortHash: shortHash(input.refHash),
    digestText: extractDigestText(input.ref),
  };
}

// --- formatters (pure, testable) --------------------------------------------

export function formatSlack(msg: NightDigestMessage): { text: string } {
  return {
    text:
      `🌙 *夜报* · ${msg.islandName}\n` +
      `${msg.digestText}\n` +
      `by ${msg.actorId} · ref \`${msg.refShortHash}\` · ${msg.islandUrl}`,
  };
}

export function formatFeishu(msg: NightDigestMessage): {
  msg_type: "text";
  content: { text: string };
} {
  return {
    msg_type: "text",
    content: {
      text:
        `🌙 夜报 · ${msg.islandName}\n` +
        `${msg.digestText}\n` +
        `by ${msg.actorId} · ref ${msg.refShortHash} · ${msg.islandUrl}`,
    },
  };
}

/** Generic JSON (also what Matrix's hookshot generic webhook expects). */
export function formatGeneric(msg: NightDigestMessage): Record<string, unknown> {
  return {
    kind: "night_digest",
    island: { slug: msg.islandSlug, name: msg.islandName, url: msg.islandUrl },
    actorId: msg.actorId,
    refHash: msg.refHash,
    refShortHash: msg.refShortHash,
    text: msg.digestText,
  };
}

export function detectProvider(url: string): WebhookProvider {
  if (url.includes("hooks.slack.com")) return "slack";
  if (url.includes("open.feishu.cn/open-apis/bot")) return "feishu";
  return "generic";
}

function formatFor(provider: WebhookProvider, msg: NightDigestMessage): unknown {
  if (provider === "slack") return formatSlack(msg);
  if (provider === "feishu") return formatFeishu(msg);
  return formatGeneric(msg);
}

/** Parses `NIGHT_DIGEST_WEBHOOKS` (comma-separated). Unset/empty → `[]` (disabled). */
export function parseWebhookUrls(env: string | undefined = process.env.NIGHT_DIGEST_WEBHOOKS): string[] {
  if (!env) return [];
  return env
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export type FetchLike = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string },
) => Promise<{ ok: boolean; status: number }>;

async function postOnce(url: string, body: unknown, fetchImpl: FetchLike): Promise<void> {
  const res = await fetchImpl(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`webhook responded ${res.status}`);
}

/** One retry on failure; gives up silently (console.warn) after the second attempt. */
async function postWithRetry(url: string, body: unknown, fetchImpl: FetchLike): Promise<void> {
  try {
    await postOnce(url, body, fetchImpl);
  } catch {
    try {
      await postOnce(url, body, fetchImpl);
    } catch (e2) {
      console.warn(`[webhook] night digest push failed (gave up after 1 retry) for ${url}:`, e2);
    }
  }
}

/**
 * Fire-and-forget dispatch to every configured webhook. Never throws — each
 * URL's failure is isolated and logged via `console.warn`. No-ops instantly
 * (no network calls at all) when no URLs are configured/passed.
 */
export async function dispatchNightDigest(
  input: NightDigestEventInput,
  opts: { urls?: string[]; fetchImpl?: FetchLike } = {},
): Promise<void> {
  const urls = opts.urls ?? parseWebhookUrls();
  if (urls.length === 0) return;
  const fetchImpl = opts.fetchImpl ?? (globalThis.fetch as unknown as FetchLike);
  const msg = buildNightDigestMessage(input);
  await Promise.allSettled(
    urls.map((url) => postWithRetry(url, formatFor(detectProvider(url), msg), fetchImpl)),
  );
}
