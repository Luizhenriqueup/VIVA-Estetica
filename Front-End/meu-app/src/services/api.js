import { isCompleteQuestionnaire } from '../data/checklist.js';
import { PERFIS } from '../constants/perfis.js';

export function canDeleteRecords(user) {
  return user?.isTemp === false && Array.isArray(user.flags) &&
    user.flags.some((flag) => flag === PERFIS.Admin.id || flag === PERFIS.Gerente.id);
}

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
  async function me(signal) {
    const user = await request('/auth/me', { signal });
    if (!user || user.userId !== getSession()?.userId || typeof user.isTemp !== 'boolean' ||
        !Array.isArray(user.flags) || user.flags.some((flag) => typeof flag !== 'string')) {
      throw new ApiError('Não foi possível confirmar as permissões do usuário.');
    }
    return user;
  }
  async function remove(path) {
    // Consultar as permissões atuais antes de cada exclusão, sem usar flags locais.
    if (!canDeleteRecords(await me())) throw new ApiError('Você não tem permissão para esta operação.', 403);
    return request(path, { method: 'DELETE' });
  }
  return {
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials, authenticated: false }),
    me,
    searchUser: (username, signal) => request('/auth/users?username=' + encodeURIComponent(username.trim()), { signal }),
    updateUserFlags: async (userId, flags) => {
      const actor = await me();
      if (actor.isTemp || !actor.flags.includes(PERFIS.Admin.id)) throw new ApiError('Você não tem permissão para esta operação.', 403);
      return request('/auth/flags', { method: 'PUT', body: { userId, flags } });
    },
    logout: () => request('/auth/logout', { method: 'POST' }),
    createTemporaryUser: async () => {
      const result = await request('/auth/register/tempLogin', { method: 'POST' });
      if (!result || ['userId', 'username', 'password'].some((key) => typeof result[key] !== 'string' || !result[key].trim())) {
        throw new ApiError('O servidor não retornou as credenciais completas. O acesso pode ter sido criado; consulte o responsável antes de gerar outro.');
      }
      return { userId: result.userId, username: result.username, password: result.password };
    },
    activate: (credentials) => request('/auth/register', { method: 'POST', body: credentials }),
    reports: (signal) => list('/reports', signal),
    report: (id, signal) => request(`/reports/${encodeURIComponent(id)}`, { signal }),
    deleteReport: (id) => remove(`/reports/${encodeURIComponent(id)}`),
    createReport: async ({ nome, questionnaire } = {}) => {
      if (typeof nome !== 'string' || !nome.trim()) throw new ApiError('Informe o nome do paciente.');
      const patientName = nome.trim();
      if (!isCompleteQuestionnaire(questionnaire)) throw new ApiError('Responda às 21 perguntas antes de enviar.');
      const answers = [...questionnaire];
      const userId = getSession()?.userId;
      const result = await request('/reports', { method: 'POST', body: { nome: patientName, questionnaire: answers } });
      if (!result || typeof result.id !== 'string' || !result.id || result.userId !== userId || result.nome !== patientName ||
          !isCompleteQuestionnaire(result.questionnaire) || result.questionnaire.some((value, index) => value !== answers[index])) {
        throw new ApiError('Não foi possível confirmar os dados salvos. Consulte o histórico antes de tentar enviar novamente.');
      }
      return result;
    },
    alerts: (signal) => list('/alerts', signal),
    alert: (id, signal) => request(`/alerts/${encodeURIComponent(id)}`, { signal }),
    deleteAlert: (id) => remove(`/alerts/${encodeURIComponent(id)}`),
    createAlert: ({ title, message }) => request('/alerts', { method: 'POST', body: { title: title.trim(), message: message.trim() } }),
  };
}
