import type { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface TraceEntry {
  l2Id: string;
  title: string;
  status: string;
}

const L2_PATTERN = /\[L2-(\d+)\]/g;

export default class TraceabilityReporter implements Reporter {
  private entries: TraceEntry[] = [];

  onTestEnd(test: TestCase, result: TestResult): void {
    const matches = [...test.title.matchAll(L2_PATTERN)];
    for (const match of matches) {
      this.entries.push({
        l2Id: `L2-${match[1]}`,
        title: test.title,
        status: result.status,
      });
    }
  }

  onEnd(_result: FullResult): void {
    const outDir = join('playwright');
    mkdirSync(outDir, { recursive: true });

    writeFileSync(join(outDir, 'traceability.json'), JSON.stringify(this.entries, null, 2));

    const grouped = new Map<string, TraceEntry[]>();
    for (const e of this.entries) {
      if (!grouped.has(e.l2Id)) grouped.set(e.l2Id, []);
      grouped.get(e.l2Id)!.push(e);
    }

    const rows = [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, tests]) => {
        const statuses = tests.map(t => t.status).join(', ');
        return `| ${id} | ${tests[0].title} | ${statuses} |`;
      });

    const md = [
      '# Traceability Matrix',
      '',
      '| L2 ID | Test Title | Status |',
      '|-------|-----------|--------|',
      ...rows,
    ].join('\n');

    writeFileSync(join(outDir, 'traceability.md'), md);

    if (this.entries.length === 0) {
      console.warn('[traceability] Warning: no tests with [L2-XX] tags found.');
    }
  }
}
