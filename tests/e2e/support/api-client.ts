const API_BASE = process.env['API_BASE_URL'] ?? 'http://localhost:5052';

export async function apiGet(path: string): Promise<Response> {
  return fetch(`${API_BASE}${path}`);
}
