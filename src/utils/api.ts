export const API_BASE = 'https://api.andjemztech.com';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const tokenKey = 'api_token_v1';

export const getToken = (): string | null => {
  try {
    const direct = localStorage.getItem(tokenKey);
    if (direct) return direct;
    const raw = localStorage.getItem('logbook_auth_user_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.token) return parsed.token as string;
    }
  } catch {}
  return null;
};

export const setToken = (token: string | null) => {
  if (token) localStorage.setItem(tokenKey, token);
  else localStorage.removeItem(tokenKey);
};

export async function apiFetch<T = any>(path: string, options?: { method?: HttpMethod; body?: any; headers?: Record<string, string> }) {
  const isDev = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)/.test(window.location.hostname);
  const relative = path.startsWith('/') ? path : `/${path}`;
  const primaryUrl = path.startsWith('http') ? path : (isDev ? relative : `${API_BASE}${relative}`);
  const token = getToken();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...options?.headers,
  };
  let body: any = undefined;
  if (options?.body !== undefined) {
    const isFormData = typeof FormData !== 'undefined' && (options.body instanceof FormData);
    if (isFormData) {
      // Let the browser set multipart/form-data boundary automatically
      body = options.body as FormData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(options.body);
    }
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const doFetch = async (urlToUse: string) => {
    const res = await fetch(urlToUse, { method: options?.method || 'GET', headers, body, mode: 'cors' });
    const text = await res.text();
    let json: any = null;
    try { json = text ? JSON.parse(text) : null; } catch { json = text as any; }
    return { res, json } as const;
  };
  const doXHR = async (urlToUse: string) => {
    return new Promise<{ res: Response; json: any }>((resolve, reject) => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open(options?.method || 'GET', urlToUse, true);
        Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            const status = xhr.status || 0;
            let data: any = xhr.responseText || '';
            try { data = data ? JSON.parse(data) : null; } catch { /* keep text */ }
            // shim a minimal Response-like object
            const res = { ok: status >= 200 && status < 300, status, statusText: xhr.statusText } as Response;
            resolve({ res, json: data });
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(body);
      } catch (e) { reject(e); }
    });
  };

  let res: Response;
  let json: any;
  try {
    ({ res, json } = await doFetch(primaryUrl));
  } catch (err) {
    // Network failure on primary; try absolute in dev
    if (isDev && !path.startsWith('http')) {
      try { ({ res, json } = await doFetch(`${API_BASE}${relative}`)); }
      catch {
        // try XHR as last resort (browser extensions may hook fetch)
        ({ res, json } = await doXHR(`${API_BASE}${relative}`));
      }
    } else {
      throw err;
    }
  }
  // Fallback: if dev and proxy returned 404 (not mapped), try absolute URL
  if (!res.ok && res.status === 404 && isDev && !path.startsWith('http')) {
    try { ({ res, json } = await doFetch(`${API_BASE}${relative}`)); }
    catch { ({ res, json } = await doXHR(`${API_BASE}${relative}`)); }
  }
  if (!res.ok) {
    const message = (json && (json.message || json.error)) || res.statusText || 'Request failed';
    const err = new Error(`${message}`);
    // eslint-disable-next-line no-console
    console.error('apiFetch error', { url: primaryUrl, status: res.status, message });
    throw err;
  }
  return json as T;
}
