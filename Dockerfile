# syntax=docker/dockerfile:1
#
# Single-process image (ROADMAP §6.1): one Node process serves the built web +
# /api + the Yjs WebSocket from one port. The server runs TS directly via tsx
# (no build step, matching the workspace's just-in-time packages); only the web
# is pre-built into apps/web/dist.
#
# better-sqlite3 is a native addon (allowlisted in pnpm-workspace.yaml's
# onlyBuiltDependencies), so the image needs a C++ toolchain to compile it.
FROM node:22-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

# Install first (better layer caching): copy just the manifests + lockfile, then
# the rest of the source.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
COPY apps/scout/package.json apps/scout/
COPY packages/core/package.json packages/core/
COPY packages/opp/package.json packages/opp/
COPY packages/data/package.json packages/data/
COPY packages/renderer/package.json packages/renderer/
COPY packages/assets/package.json packages/assets/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @frontier-isles/web build

ENV NODE_ENV=production \
    PORT=8080 \
    DB_FILE=/data/isles.db \
    WEB_DIST=/app/apps/web/dist
RUN mkdir -p /data
EXPOSE 8080

WORKDIR /app/apps/server
# `pnpm start` → `tsx src/index.ts`; the entry auto-seeds an empty DB and, with
# WEB_DIST present, serves the SPA + assets from the same port.
CMD ["pnpm", "start"]
