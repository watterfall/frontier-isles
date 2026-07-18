import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

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
    baseURL: 'http://127.0.0.1:5173',
    colorScheme: 'light',
    reducedMotion: 'reduce',
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
      command: 'pnpm --filter @frontier-isles/server dev',
      cwd: repoRoot,
      url: 'http://127.0.0.1:8787/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @frontier-isles/web exec vite --host 127.0.0.1',
      cwd: repoRoot,
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
