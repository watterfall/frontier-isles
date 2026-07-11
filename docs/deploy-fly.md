# Deploy to Fly.io — runbook

Single-process deploy per ROADMAP §6.1: **one Node process serves the built web + `/api` + the Yjs WebSocket** from one port, with the SQLite ledger on a mounted volume. This is a copy-paste runbook — follow it top to bottom.

## What's already done (committed, validated)

- **Server serves the web** when `WEB_DIST` is present (`apps/server/src/index.ts`) — API + `/yjs` win, SPA falls back to `index.html`. Dev is untouched (Vite still owns `:5173`).
- **`Dockerfile`** — `node:22-slim` + C++ toolchain for `better-sqlite3`; `pnpm install` → build web → run server via `tsx`.
- **`fly.toml`** — single-process app, internal port 8080, `/data` volume, scale-to-zero.
- **`.dockerignore`** — trims the build context.

Validated end-to-end in a real container (`docker build` + run): `/`→HTML, `/api/islands`→JSON, `/island/x`→SPA fallback, `/assets/*`→JS, `POST /api/auth/dev-login`→403 in prod, DB auto-seeds all islands. Fly's remote builder runs the **same** `Dockerfile`, so a clean local build ⇒ a clean Fly build.

## Prerequisites

- A Fly.io account.
- **Mainland-China note:** `flyctl` talks to `api.fly.io` / `registry.fly.io`, which are flaky/blocked on bare mainland networks — deploy through a proxy/VPN if `fly auth login` or `fly deploy` hangs. (If a `curl -I https://fly.io` routes you to a `sjc`/US region, you're already on a US-exit path and deploy will be fine.) For **mainland end-users**, Fly has no China region (nearest: `hkg`/`nrt`/`sin`) and cross-border throughput is throttled — see "If you outgrow Fly" below.

## Deploy steps

Placeholders to pick first: **`<app>`** (globally-unique Fly app name), **`<region>`** (e.g. `nrt` Tokyo · `sin` Singapore · `hkg` Hong Kong · `sjc` San Jose).

### 1. Install + log in (operator-only)

```bash
brew install flyctl            # or: curl -L https://fly.io/install.sh | sh
fly auth login
```

### 2. Edit `fly.toml` (repo root)

Set three fields:

```toml
app = "<app>"
primary_region = "<region>"
WEB_ORIGIN = "https://<app>.fly.dev"   # public URL = OAuth redirect base + CORS origin
```

### 3. Create the app + the DB volume

The volume name **must** be `isles_data` (matches `fly.toml`'s `[[mounts]] source`), and its region must match `primary_region`.

```bash
fly apps create <app>
fly volumes create isles_data --region <region> --size 1 -a <app>
```

### 4. Register a GitHub OAuth app (operator-only, browser)

GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**:

- **Homepage URL:** `https://<app>.fly.dev`
- **Authorization callback URL:** `https://<app>.fly.dev/api/auth/github/callback`  ← exact path, verified in `apps/server/src/app.ts`
- Copy the **Client ID**, generate a **Client Secret**.

> Skip this and the app still deploys, but production has **no login** (`dev-login` is `403` when `NODE_ENV=production`) — the site is read-only until secrets are set.

### 5. Set the secrets

```bash
fly secrets set GITHUB_CLIENT_ID=<id> GITHUB_CLIENT_SECRET=<secret> -a <app>
```

### 6. Deploy

```bash
fly deploy
```

`fly deploy` uses a **remote builder** by default — it uploads the source and builds the `Dockerfile` on Fly (no local Docker needed; the 807 MB image never leaves Fly). First build ≈ a few minutes (apt + `pnpm install` compiling `better-sqlite3` + web build).

### 7. Keep it to one machine (SQLite is single-writer)

```bash
fly scale count 1 -a <app>
```

One volume ⇒ one machine. Don't scale past 1 without moving off single-file SQLite.

## Verify

```bash
fly open                                   # opens https://<app>.fly.dev
fly logs -a <app>                          # expect: "[server] serving web from …", "[seed] seeded N islands"
curl -sf https://<app>.fly.dev/api/islands # JSON roster
```

Then in the browser: the atlas loads, an island opens, and **Login with GitHub** completes the round-trip (if step 4–5 done).

## Update / redeploy

Just re-run from the repo:

```bash
fly deploy
```

The volume persists, so the ledger + founded islands survive. No migration step — `db.ts` runs plain-SQL migrations at boot.

## Operational notes

- **Data lives on the volume** (`/data/isles.db`). It survives redeploys and machine restarts. Back it up with `fly ssh console -a <app>` + copy out, or snapshot the volume.
- **Scale-to-zero** (`min_machines_running = 0` in `fly.toml`): the machine sleeps when idle (cheap), cold-starts on the next request. In-memory Yjs canvas rooms are lost on sleep — but they fold to a ledger `bridge_artifact` on empty anyway, and the DB is on the volume. Want always-warm / always-live rooms? Set `min_machines_running = 1`.
- **Secrets** are injected as env vars at runtime; rotate with `fly secrets set …` (triggers a redeploy).
- **`WEB_ORIGIN`** must equal the public URL or OAuth redirect + cookie `secure` flag break. If you attach a custom domain, update `WEB_ORIGIN` **and** the GitHub OAuth app's callback URL.
- **Production hardening still open** (ROADMAP §3.7): session expiry/cleanup, rate limits. `secure` cookies already switch on automatically when `WEB_ORIGIN` is `https`.

## If you outgrow Fly (e.g. mainland-China users)

The `Dockerfile` is **host-agnostic** — the same image runs on any Docker host:

- **Domestic cloud** (Aliyun / Tencent ECS + Docker): best latency for mainland users, but a public site needs **ICP 备案** (domestic entity + filing process). Swap `fly.toml` for that platform's config; keep the `Dockerfile`.
- **Hong Kong / Singapore region + a China-friendly CDN** fronting static assets: a middle ground, no 备案.

Nothing in the app is Fly-specific except `fly.toml`; the port/env contract (`PORT`, `DB_FILE`, `WEB_DIST`, `WEB_ORIGIN`, `GITHUB_CLIENT_*`, `NODE_ENV`) is portable.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `fly auth login` / `fly deploy` hangs | Mainland network to `api.fly.io`/`registry.fly.io` — deploy through a proxy/VPN. |
| Build fails at `better-sqlite3` | Toolchain missing — the `Dockerfile` installs `python3 make g++`; don't strip them. |
| App up but login fails | `WEB_ORIGIN` ≠ public URL, or the GitHub OAuth callback URL doesn't match `https://<app>.fly.dev/api/auth/github/callback`, or secrets unset. |
| `403` on any write / login | `NODE_ENV=production` disables `dev-login` by design — real login needs the GitHub OAuth secrets (step 4–5). |
| Second machine won't start | Only one `isles_data` volume exists — run `fly scale count 1`. |
| Data gone after redeploy | The volume didn't mount — confirm `fly volumes list -a <app>` shows `isles_data` and `fly.toml`'s `[[mounts]]` destination is `/data`. |
