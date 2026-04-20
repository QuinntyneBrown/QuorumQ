const API_BASE = process.env['API_BASE_URL'] ?? 'http://localhost:5052';

export async function apiGet(path: string): Promise<Response> {
  return fetch(`${API_BASE}${path}`);
}

export async function apiPost<T>(path: string, body: T): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function apiDelete(path: string): Promise<Response> {
  return fetch(`${API_BASE}${path}`, { method: 'DELETE' });
}
