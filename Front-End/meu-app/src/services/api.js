export class ApiError extends Error {
  constructor(message, status = 0) { super(message); this.name = 'ApiError'; this.status = status; }
}
export function createApi({ baseUrl = '', getSession = () => null, onUnauthorized = () => {}, fetcher = fetch } = {}) {
  async function request(path, { method = 'GET', body, signal, authenticated = true } = {}) {
    const session = authenticated ? getSession() : null;
    if (authenticated && (!session || Date.parse(session.expiresAt) <= Date.now())) {
      onUnauthorized(session?.token);
      throw new ApiError('Sua sessão expirou. Entre novamente.', 401);
    }
    let response;
    try {
      response = await fetcher(`${baseUrl.replace(/\/$/, '')}${path}`, {
        method, signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000), cache: 'no-store',
        headers: { Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(session ? { Authorization: `Bearer ${session.token}` } : {}) },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      if (error.name === 'TimeoutError') throw new ApiError('O servidor demorou para responder. Tente novamente.');
      throw new ApiError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
    }
    if (response.status === 204) return null;
    let data;
    try { data = await response.json(); } catch { data = null; }
    if (!response.ok) {
      if (response.status === 401 && authenticated) onUnauthorized(session?.token);
      const fallback = response.status === 403 ? 'Você não tem permissão para esta operação.' : response.status === 401 ? 'Sua sessão expirou. Entre novamente.' : 'Não foi possível concluir a solicitação.';
      throw new ApiError(typeof data?.message === 'string' ? data.message : fallback, response.status);
    }
    if (data === null) throw new ApiError('O servidor retornou uma resposta inesperada. Verifique a configuração da API.', response.status);
    return data;
  }
  async function list(path, signal) {
    const data = await request(path, { signal });
    if (!Array.isArray(data)) throw new ApiError('A lista recebida do servidor é inválida.');
    return data;
  }
  return {
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials, authenticated: false }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    activate: (credentials) => request('/auth/register', { method: 'POST', body: credentials }),
    reports: (signal) => list('/reports', signal),
    alerts: (signal) => list('/alerts', signal),
    alert: (id, signal) => request(`/alerts/${encodeURIComponent(id)}`, { signal }),
    createAlert: ({ title, message }) => request('/alerts', { method: 'POST', body: { title: title.trim(), message: message.trim() } }),
  };
}
