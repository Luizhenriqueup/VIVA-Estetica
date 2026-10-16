import test from 'node:test';
import assert from 'node:assert/strict';
import { createApi } from '../src/services/api.js';
import { ANSWERS, QUESTIONS, STAGES, isCompleteQuestionnaire } from '../src/data/checklist.js';
import { isValidSession, readSession, saveSession, clearSession } from '../src/services/session.js';
const session = () => ({ userId: 'user-1', token: 'opaque-._~token', expiresAt: new Date(Date.now() + 60000).toISOString() });
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
test('checklist mantém o contrato de 21 respostas e seis itens críticos', () => {
  assert.deepEqual(ANSWERS, ['Adequado', 'Parcial', 'Inadequado']);
  assert.deepEqual(STAGES.map((stage) => stage.questions.length), [8, 6, 5, 2]);
  assert.deepEqual(QUESTIONS.flatMap((question, index) => question.critical ? [index] : []), [0, 1, 7, 8, 9, 12]);
  assert.equal(isCompleteQuestionnaire(Array(21).fill(0)), true);
  for (const invalid of [[], Array(21), Array(20).fill(0), Array(22).fill(0), Array(21).fill(null), Array(21).fill('0'), Array(21).fill(3), Array(21).fill(-1)]) {
    assert.equal(isCompleteQuestionnaire(invalid), false);
  }
});
test('checklist envia nome normalizado e questionnaire, com Bearer, e consulta detalhe pelo ID', async () => {
  const saved = session(); const calls = [];
  const questionnaire = Array.from({ length: 21 }, (_, index) => index % 3);
  const report = { id: 'report-1', userId: saved.userId, nome: 'Paciente de teste', questionnaire };
  const api = createApi({ getSession: () => saved, fetcher: async (...args) => { calls.push(args); return json(report, 201); } });
  assert.deepEqual(await api.createReport({ nome: '  Paciente de teste  ', questionnaire }), report);
  assert.equal(calls[0][0], '/reports');
  assert.equal(calls[0][1].method, 'POST');
  assert.equal(calls[0][1].headers.Authorization, 'Bearer ' + saved.token);
  assert.deepEqual(JSON.parse(calls[0][1].body), { nome: 'Paciente de teste', questionnaire });
  await api.report('id/abc');
  assert.equal(calls[1][0], '/reports/id%2Fabc');
  assert.equal(calls[1][1].method, 'GET');
});
test('respostas incompletas não são enviadas e resposta inesperada não confirma sucesso', async () => {
  let calls = 0;
  const api = createApi({ getSession: session, fetcher: async () => { calls++; return json({ id: 'r', userId: 'user-1', questionnaire: [] }, 201); } });
  await assert.rejects(api.createReport({ nome: 'Teste', questionnaire: [0, 1] }), /21 perguntas/);
  assert.equal(calls, 0);
  await assert.rejects(api.createReport({ nome: 'Teste', questionnaire: Array(21).fill(0) }), /confirmar os dados salvos/);
  assert.equal(calls, 1);
});
test('falha de envio de checklist preserva as respostas e não repete automaticamente', async () => {
  const answers = Array(21).fill(2); let calls = 0;
  const api = createApi({ getSession: session, fetcher: async () => { calls++; return json({ message: 'Falha de gravação' }, 500); } });
  await assert.rejects(api.createReport({ nome: 'Teste', questionnaire: answers }), { status: 500, message: 'Falha de gravação' });
  assert.deepEqual(answers, Array(21).fill(2)); assert.equal(calls, 1);
});
test('nome ausente, vazio ou inválido impede envio do checklist', async () => {
  let calls = 0;
  const api = createApi({ getSession: session, fetcher: async () => { calls++; return json({}); } });
  for (const nome of [undefined, null, '', '   ', 123, {}]) {
    await assert.rejects(api.createReport({ nome, questionnaire: Array(21).fill(0) }), /nome do paciente/);
  }
  assert.equal(calls, 0);
});
test('não confirma gravação se o servidor devolver outro paciente ou omitir nome', async () => {
  for (const nome of ['Outro paciente', undefined]) {
    const api = createApi({ getSession: session, fetcher: async () => json({ id: 'r', userId: 'user-1', nome, questionnaire: Array(21).fill(0) }, 201) });
    await assert.rejects(api.createReport({ nome: 'Paciente de teste', questionnaire: Array(21).fill(0) }), /confirmar os dados salvos/);
  }
});
test('consulta preserva nome retornado e aceita registros antigos sem nome', async () => {
  const records = [{ id: 'novo', nome: 'Paciente de teste', questionnaire: Array(21).fill(0) }, { id: 'antigo', questionnaire: Array(21).fill(0) }];
  const api = createApi({ getSession: session, fetcher: async () => json(records) });
  assert.deepEqual(await api.reports(), records);
});
test('login envia username/password, sem Bearer e preserva a senha', async () => {
  let call;
  const api = createApi({ baseUrl: 'http://example.test/', fetcher: async (...args) => { call = args; return json(session()); } });
  await api.login({ username: 'joao', password: ' senha ' });
  assert.equal(call[0], 'http://example.test/auth/login');
  assert.equal(call[1].method, 'POST');
  assert.deepEqual(JSON.parse(call[1].body), { username: 'joao', password: ' senha ' });
  assert.equal(call[1].headers.Authorization, undefined);
});
test('listas usam Bearer e retornam os arrays sem paginação inventada', async () => {
  const saved = session(); const calls = [];
  const api = createApi({ getSession: () => saved, fetcher: async (...args) => { calls.push(args); return json([]); } });
  assert.deepEqual(await api.reports(), []); assert.deepEqual(await api.alerts(), []);
  assert.deepEqual(calls.map(([url]) => url), ['/reports', '/alerts']);
  assert.ok(calls.every(([, options]) => options.headers.Authorization === 'Bearer ' + saved.token && options.method === 'GET'));
});
test('criação de alerta usa title/message e detalhe codifica o ID', async () => {
  const calls = [];
  const api = createApi({ getSession: session, fetcher: async (...args) => { calls.push(args); return json({ id: 'a' }, 201); } });
  await api.createAlert({ title: ' Aviso ', message: ' Texto ' }); await api.alert('id/abc');
  assert.equal(calls[0][0], '/alerts'); assert.equal(calls[0][1].method, 'POST');
  assert.deepEqual(JSON.parse(calls[0][1].body), { title: 'Aviso', message: 'Texto' });
  assert.equal(calls[1][0], '/alerts/id%2Fabc');
});
test('401 autenticado encerra sessão, 403 preserva sessão e mensagem', async () => {
  let expired = 0; let status = 403;
  const api = createApi({ getSession: session, onUnauthorized: () => expired++, fetcher: async () => json({ message: 'Sem permissão' }, status) });
  await assert.rejects(api.alerts(), { status: 403, message: 'Sem permissão' }); assert.equal(expired, 0);
  status = 401; await assert.rejects(api.alerts(), { status: 401 }); assert.equal(expired, 1);
});
test('401 no login não aciona expiração global', async () => {
  let expired = false;
  const api = createApi({ onUnauthorized: () => { expired = true; }, fetcher: async () => json({ message: 'Usuário ou senha inválidos.' }, 401) });
  await assert.rejects(api.login({}), { status: 401 }); assert.equal(expired, false);
});
test('logout aceita 204 e ativação envia o contrato existente', async () => {
  const calls = [];
  const api = createApi({ getSession: session, fetcher: async (...args) => { calls.push(args); return args[0] === '/auth/logout' ? new Response(null, { status: 204 }) : json({ userId: 'u', username: 'novo', isTemp: false }); } });
  assert.equal(await api.logout(), null);
  await api.activate({ username: 'novo', password: 'abcdefgh' });
  assert.equal(calls[0][1].method, 'POST'); assert.equal(calls[1][0], '/auth/register');
  assert.deepEqual(JSON.parse(calls[1][1].body), { username: 'novo', password: 'abcdefgh' });
});
test('falhas de rede, timeout, HTML e listas inválidas têm erro legível', async () => {
  for (const fetcher of [
    async () => { throw new TypeError('Failed to fetch'); },
    async () => { throw new DOMException('timeout', 'TimeoutError'); },
    async () => new Response('<html>SPA</html>'),
    async () => json({ items: [] }),
    async () => json({ message: 'Erro interno do servidor.' }, 500),
  ]) await assert.rejects(createApi({ getSession: session, fetcher }).reports(), (error) => error.name === 'ApiError' && error.message.length > 0);
});
test('sessão vencida bloqueia requisição antes de enviar', async () => {
  let sent = false; let expired = false;
  const api = createApi({ getSession: () => ({ ...session(), expiresAt: '2000-01-01' }), onUnauthorized: () => { expired = true; }, fetcher: async () => { sent = true; } });
  await assert.rejects(api.reports(), { status: 401 }); assert.equal(sent, false); assert.equal(expired, true);
});
test('persistência armazena só contrato de sessão, limpa corrupção e logout', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
  const value = session();
  saveSession({ ...value, password: 'nunca guardar', flags: ['Admin'] }, storage);
  assert.deepEqual(readSession(storage), value);
  clearSession(storage); assert.equal(readSession(storage), null);
  storage.setItem('viva.session', '{bad'); assert.equal(readSession(storage), null);
  storage.setItem('viva.session', JSON.stringify({ ...value, expiresAt: '2000-01-01' })); assert.equal(readSession(storage), null);
  assert.equal(isValidSession({ ...value, token: 'invalid token' }), false);
  assert.throws(() => saveSession(null, storage));
});
test('armazenamento bloqueado não permite falsa persistência', () => {
  const storage = { getItem() { throw new Error(); }, setItem() { throw new Error(); }, removeItem() { throw new Error(); } };
  assert.equal(readSession(storage), null);
  assert.throws(() => saveSession(session(), storage), /guardar a sessão/);
  assert.doesNotThrow(() => clearSession(storage));
});
test('a sessão exibe o nome aceito no login e só marca temporário quando o backend confirma', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
  const value = session();
  const regular = saveSession({ ...value, username: ' Bruno ', isTemp: false }, storage);
  assert.deepEqual(regular, { ...value, username: 'Bruno', isTemp: false });
  assert.deepEqual(readSession(storage), regular);
  const temporary = saveSession({ ...value, username: '12345678', isTemp: true }, storage);
  assert.equal(temporary.isTemp, true);
  assert.equal(temporary.username, '12345678');
  const legacy = saveSession(value, storage);
  assert.equal(legacy.username, undefined);
  assert.equal(legacy.isTemp, undefined);
  assert.throws(() => saveSession({ ...value, username: {}, isTemp: 'true' }, storage), /Resposta de autenticação inválida/);
});
