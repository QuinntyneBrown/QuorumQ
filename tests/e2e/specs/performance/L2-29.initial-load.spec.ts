import { test, expect } from '@playwright/test';
import { createGzip } from 'zlib';
import { createReadStream } from 'fs';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { pipeline } from 'stream/promises';
import { Writable } from 'stream';

const DIST_DIR = join(__dirname, '../../../../src/web/dist/app/browser');
const LCP_BUDGET_MS = 2500;
const TTI_BUDGET_MS = 3500;
const BUNDLE_BUDGET_BYTES = 200 * 1024; // 200 KB gzipped

async function gzipSize(filePath: string): Promise<number> {
  let size = 0;
  const counter = new Writable({
    write(chunk, _enc, cb) {
      size += chunk.length;
      cb();
    },
  });
  await pipeline(createReadStream(filePath), createGzip(), counter);
  return size;
}

async function totalInitialJsGzip(): Promise<number> {
  const entries = await readdir(DIST_DIR);
  // main bundle chunks — exclude lazy feature chunks (contain a hash segment like .[hash].js)
  // Angular CLI names the initial bundles: main-*.js, polyfills-*.js, runtime-*.js
  const initialBundles = entries.filter(
    f => f.endsWith('.js') && /^(main|polyfills|runtime)/.test(f),
  );
  let total = 0;
  for (const bundle of initialBundles) {
    total += await gzipSize(join(DIST_DIR, bundle));
  }
  return total;
}

async function measureLcp(page: import('@playwright/test').Page): Promise<number> {
  // Inject PerformanceObserver before navigation to capture LCP
  await page.addInitScript(() => {
    (window as Record<string, unknown>)['__lcpValue'] = null;
    const obs = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
      (window as Record<string, unknown>)['__lcpValue'] = last.startTime;
    });
    obs.observe({ type: 'largest-contentful-paint', buffered: true });
  });

  const cdp = await page.context().newCDPSession(page);
  // 4× CPU slow-down + approximate 4G network via CDP
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (9 * 1024 * 1024) / 8,  // 9 Mbps
    uploadThroughput: (750 * 1024) / 8,           // 750 kbps
    latency: 170,
  });
  await cdp.send('Network.enable', {});

  // Clear cache for a cold load
  await cdp.send('Network.clearBrowserCache');

  await page.goto('/', { waitUntil: 'networkidle' });

  // Give LCP a moment to settle after networkidle
  await page.waitForTimeout(500);

  const lcp = await page.evaluate(() => (window as Record<string, unknown>)['__lcpValue'] as number | null);
  await cdp.detach();
  return lcp ?? 0;
}

async function measureTti(page: import('@playwright/test').Page): Promise<number> {
  await page.addInitScript(() => {
    (window as Record<string, unknown>)['__navigationStart'] = null;
    const obs = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          (window as Record<string, unknown>)['__navigationStart'] = (entry as PerformanceNavigationTiming).startTime;
        }
      }
    });
    obs.observe({ type: 'navigation', buffered: true });
  });

  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (9 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
    latency: 170,
  });
  await cdp.send('Network.enable', {});
  await cdp.send('Network.clearBrowserCache');

  const navStart = Date.now();
  await page.goto('/', { waitUntil: 'networkidle' });

  // Wait until the app shell is interactive (sign-in or app-shell rendered)
  await page.waitForSelector('[data-testid="app-shell"], [data-testid="sign-in-card"]', {
    timeout: TTI_BUDGET_MS + 2000,
  });

  // TTI approximation: time from nav start to when shell becomes interactive
  const tti = Date.now() - navStart;
  await cdp.detach();
  return tti;
}

// LCP/TTI tests require a production build served at WEB_BASE_URL.
// Set PERF_ENABLED=1 to run these tests; skip otherwise to avoid dev-server false failures.
const PERF_ENABLED = !!process.env['PERF_ENABLED'];

test.describe('Initial load performance', () => {
  test('[L2-29] cold load on throttled 4G produces LCP ≤ 2.5 s', async ({ page, browserName }) => {
    if (!PERF_ENABLED) {
      test.skip(true, 'Set PERF_ENABLED=1 to run performance tests against a production build');
      return;
    }
    test.skip(browserName !== 'chromium', 'CDP-based perf measurement requires Chromium');

    const lcp = await measureLcp(page);
    expect(lcp, `LCP was ${lcp.toFixed(0)} ms — budget is ${LCP_BUDGET_MS} ms`).toBeLessThanOrEqual(LCP_BUDGET_MS);
  });

  test('[L2-29] cold load on throttled 4G produces TTI ≤ 3.5 s', async ({ page, browserName }) => {
    if (!PERF_ENABLED) {
      test.skip(true, 'Set PERF_ENABLED=1 to run performance tests against a production build');
      return;
    }
    test.skip(browserName !== 'chromium', 'CDP-based perf measurement requires Chromium');

    const tti = await measureTti(page);
    expect(tti, `TTI was ${tti} ms — budget is ${TTI_BUDGET_MS} ms`).toBeLessThanOrEqual(TTI_BUDGET_MS);
  });

  test('[L2-29] initial JS bundle sent to mobile is ≤ 200 KB gzipped', async () => {
    let distExists = false;
    try {
      await stat(DIST_DIR);
      distExists = true;
    } catch {
      // dist dir may not exist in dev; skip gracefully with a clear message
    }

    if (!distExists) {
      test.skip(true, `Production build not found at ${DIST_DIR}. Run 'npm run build' first.`);
      return;
    }

    const totalGzip = await totalInitialJsGzip();
    const totalKb = (totalGzip / 1024).toFixed(1);
    expect(
      totalGzip,
      `Initial JS bundles = ${totalKb} KB gzipped — budget is ${BUNDLE_BUDGET_BYTES / 1024} KB`,
    ).toBeLessThanOrEqual(BUNDLE_BUDGET_BYTES);
  });
});
