import { Browser, BrowserContext } from '@playwright/test';

export interface MultiContextHandle {
  contexts: BrowserContext[];
  close: () => Promise<void>;
}

export async function createMultiContext(
  browser: Browser,
  count: number,
): Promise<MultiContextHandle> {
  const contexts: BrowserContext[] = [];
  for (let i = 0; i < count; i++) {
    contexts.push(await browser.newContext());
  }
  return {
    contexts,
    close: async () => {
      for (const ctx of contexts) await ctx.close();
    },
  };
}
