import test from 'node:test';
import assert from 'node:assert/strict';
import { createApi } from '../src/services/api.js';
import { isValidSession, readSession, saveSession, clearSession } from '../src/services/session.js';
const session = () => ({ userId: 'user-1', token: 'opaque-._~token', expiresAt: new Date(Date.now() + 60000).toISOString() });
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
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
