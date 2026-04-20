import { spawn } from 'child_process';
import { apiGet } from './support/api-client';

const API_BASE = process.env['API_BASE_URL'] ?? 'http://localhost:5052';
const WEB_BASE = process.env['WEB_BASE_URL'] ?? 'http://localhost:4200';

async function waitForUrl(url: string, maxMs = 60_000): Promise<void> {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(url);
      if (r.ok || r.status < 500) return;
    } catch {
      // not ready yet
    }
    await new Promise(r => setTimeout(r, 1_000));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function isUp(url: string): Promise<boolean> {
  try {
    await fetch(url);
    return true;
  } catch {
    return false;
  }
}

export default async function globalSetup() {
  if (!(await isUp(`${API_BASE}/health`))) {
    spawn('dotnet', ['run', '--project', 'src/api/QuorumQ.Api'], {
      cwd: process.cwd(),
      stdio: 'ignore',
      detached: true,
    }).unref();
    await waitForUrl(`${API_BASE}/health`);
  }

  if (!(await isUp(WEB_BASE))) {
    spawn('npx', ['ng', 'serve', '--project', 'app'], {
      cwd: 'src/web',
      stdio: 'ignore',
      detached: true,
      shell: true,
    }).unref();
    await waitForUrl(WEB_BASE);
  }
}
