import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
// A release gate must own the services it verifies. Developers may opt into
// borrowing an already-running local stack for interactive diagnosis, but a
// plain `pnpm test:e2e` starts and tears down a fresh pair of processes.
const reuseExistingServers = process.env.PLAYWRIGHT_REUSE_EXISTING_SERVERS === '1';
const webPort = Number(process.env.FI_E2E_WEB_PORT ?? 5173);
const apiPort = Number(process.env.FI_E2E_API_PORT ?? 8787);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  // CI runners simulate world time slower than the clock (few rendered frames
  // × 50ms dt clamp), so the exploration round trip legitimately needs longer
  // there; locally the test still finishes in ~35s.
  timeout: process.env.CI ? 150_000 : 60_000,
  // Screen transitions (dock, return-to-craft) animate through the same
  // dt-clamped world sim — at CI frame rates they can exceed the 5s default.
  expect: { timeout: process.env.CI ? 30_000 : 5_000 },
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${webPort}`,
    colorScheme: 'light',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        launchOptions: {
          args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'],
        },
      },
    },
  ],
  webServer: [
    {
      // E2E does not edit server source. Avoid the extra `tsx watch`
      // supervisor so Playwright owns one stable, non-restarting process tree.
      command: 'pnpm --filter @frontier-isles/server start',
      env: { PORT: String(apiPort), WEB_ORIGIN: `http://127.0.0.1:${webPort}` },
      cwd: repoRoot,
      url: `http://127.0.0.1:${apiPort}/api/health`,
      reuseExistingServer: reuseExistingServers,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: `pnpm --filter @frontier-isles/web exec vite --host 127.0.0.1 --port ${webPort} --strictPort`,
      env: { FI_API_TARGET: `http://127.0.0.1:${apiPort}` },
      cwd: repoRoot,
      url: `http://127.0.0.1:${webPort}`,
      reuseExistingServer: reuseExistingServers,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
