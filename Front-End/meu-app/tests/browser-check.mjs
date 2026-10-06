// Testes de interface com fixtures explícitas: não conectam ao banco real.
// Requer servidor do frontend e Playwright disponível. Não integra o bundle.
// node tests/browser-check.mjs; opcionais: PLAYWRIGHT_MODULE, TEST_BASE_URL,
// BROWSER_EXECUTABLE, TEST_OUTPUT_DIR.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const moduleName = process.env.PLAYWRIGHT_MODULE;
const { chromium } = await import(moduleName ? pathToFileURL(moduleName).href : 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
const origin = process.env.TEST_BASE_URL || 'http://127.0.0.1:4173';
const output = process.env.TEST_OUTPUT_DIR || 'test-results';
await mkdir(output, { recursive: true });
const checks = [];
const check = (name) => { checks.push(name); console.log('PASS ' + name); };
let role = 'Funcionario', mode = 'normal', creates = 0, loginCalls = 0, lastLogin, logoutCalls = 0;
let alerts = [{ id: 'alert-1', title: 'Aviso de teste', message: 'Descrição de teste.\nSegunda linha.', createdAt: '2026-10-06T12:00:00Z', updatedAt: '2026-10-06T12:00:00Z' }];
const errors = [];
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await context.route('**/*', async (route) => {
  const url = new URL(route.request().url());
  if (url.origin !== origin) return route.abort();
  const pathname = url.pathname;
  if (!/^\/(auth|reports|alerts)(\/|$)/.test(pathname)) return route.continue();
  const request = route.request();
  const method = request.method();
  const respond = (status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  if (pathname === '/auth/login') {
    loginCalls++; lastLogin = request.postDataJSON();
    assert.equal(method, 'POST'); assert.equal(request.headers().authorization, undefined);
    if (lastLogin.username === 'invalido') return respond(401, { message: 'Usuário ou senha inválidos.' });
    if (lastLogin.username === 'offline') return route.abort('connectionfailed');
    if (lastLogin.username === 'erro') return respond(500, { message: 'Erro interno do servidor.' });
    if (lastLogin.username === 'lento') await new Promise((resolve) => setTimeout(resolve, 600));
    return respond(200, { userId: 'user-test', token: 'opaque-test-token', expiresAt: new Date(Date.now() + 3600000).toISOString() });
  }
  assert.equal(request.headers().authorization, 'Bearer opaque-test-token');
  if (pathname === '/auth/logout') { logoutCalls++; return route.fulfill({ status: 204 }); }
  if (pathname === '/auth/register') {
    assert.equal(method, 'POST');
    const data = request.postDataJSON();
    assert.deepEqual(data, { username: 'usuario-novo', password: 'nova-senha' });
    return respond(200, { userId: 'user-test', username: data.username, isTemp: false });
  }
  if (mode === 'expired') return respond(401, { message: 'Token inválido ou expirado.' });
  if (mode === 'forbidden') return respond(403, { message: 'Você não tem permissão para esta operação.' });
  if (mode === 'offline') return route.abort('connectionfailed');
  if (mode === 'slow') await new Promise((resolve) => setTimeout(resolve, 600));
  if (pathname === '/reports') {
    assert.equal(method, 'GET');
    return respond(200, mode === 'empty' ? [] : [{ id: 'report-123456789012345678901234567890', userId: 'user-test' }]);
  }
  if (pathname === '/alerts' && method === 'POST') {
    creates++;
    assert.deepEqual(request.postDataJSON(), { title: 'Alerta novo', message: 'Descrição nova' });
    if (role === 'Funcionario') return respond(403, { message: 'Você não tem permissão para esta operação.' });
    const item = { id: 'alert-' + creates, ...request.postDataJSON(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    alerts = [item, ...alerts];
    return respond(201, item);
  }
  if (pathname === '/alerts') return respond(200, mode === 'empty' ? [] : alerts);
  if (pathname.startsWith('/alerts/')) return respond(200, alerts.find((item) => item.id === pathname.split('/').at(-1)) || alerts[0]);
  throw new Error('Endpoint inesperado: ' + pathname);
});
const page = await context.newPage();
page.on('pageerror', (error) => errors.push(error.message));
async function visible(locator) { await locator.first().waitFor({ state: 'visible' }); }
async function login(username = 'usuario') {
  await page.goto(origin + '/');
  await page.getByLabel('Usuário', { exact: true }).fill(username);
  await page.getByLabel('Senha', { exact: true }).fill(' senha preservada ');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
}
async function nav(route, title) {
  await page.goto(origin + route);
  await visible(page.getByRole('heading', { name: title, exact: true }));
}
try {
  await page.goto(origin + '/checklists');
  await visible(page.getByRole('heading', { name: 'Bem-vindo(a)' }));
  assert.equal(new URL(page.url()).pathname, '/');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  assert.equal(loginCalls, 0); check('rotas protegidas e campos obrigatórios');
  await login('invalido'); await visible(page.getByRole('alert').filter({ hasText: 'Usuário ou senha inválidos.' }));
  await login('erro'); await visible(page.getByRole('alert').filter({ hasText: 'Erro interno' }));
  await login('offline'); await visible(page.getByRole('alert').filter({ hasText: 'Não foi possível conectar' }));
  check('login inválido, erro 500 e indisponibilidade');
  await login('lento'); await visible(page.getByRole('button', { name: 'Entrando…' }));
  assert.equal(await page.getByRole('button', { name: 'Entrando…' }).isDisabled(), true);
  await visible(page.getByRole('heading', { name: 'Painel', exact: true }));
  assert.deepEqual(lastLogin, { username: 'lento', password: ' senha preservada ' });
  check('login válido, loading, body exato e redirecionamento');
  await page.reload(); await visible(page.getByRole('heading', { name: 'Painel', exact: true }));
  const stored = await page.evaluate(() => JSON.parse(sessionStorage.getItem('viva.session')));
  assert.deepEqual(Object.keys(stored).sort(), ['expiresAt', 'token', 'userId']);
  await visible(page.getByText('Não informado pelo sistema'));
  assert.equal(await page.getByRole('button', { name: /Administrador|Gerente|Funcionário/ }).count(), 0);
  check('persistência sem senha ou perfil fictício');
  for (const [route, title] of [['/relatorios', 'Relatórios'], ['/checklists', 'Checklists feitos'], ['/alertas', 'Alertas'], ['/pops', 'POPs'], ['/conteudo', 'Conteúdo educativo'], ['/ativar-conta', 'Ativar conta temporária']]) await nav(route, title);
  check('todas as páginas navegáveis');
  await nav('/relatorios', 'Relatórios');
  assert.equal(await page.getByRole('button', { name: 'Finalizar checklist' }).isDisabled(), true);
  await page.getByLabel('Nome do cliente').fill('Cliente de teste');
  await page.getByRole('button', { name: 'Alerta', exact: true }).click();
  await page.getByRole('button', { name: 'Publicar alerta' }).click();
  assert.equal(creates, 0);
  await page.getByLabel('Título do alerta').fill('Alerta novo');
  await page.getByLabel('Descrição do alerta').fill('Descrição nova');
  await page.getByRole('button', { name: 'Publicar alerta' }).click();
  await visible(page.getByRole('alert').filter({ hasText: 'Você não tem permissão' }));
  check('checklist não envia dados incompatíveis e funcionário recebe 403');
  for (const profile of ['Gerente', 'Admin']) {
    role = profile;
    await page.getByRole('button', { name: 'Publicar alerta' }).click();
    await visible(page.getByRole('status').filter({ hasText: 'Alerta publicado com sucesso.' }));
    await visible(page.getByRole('heading', { name: 'Alerta novo', exact: true }));
    check('publicação permitida com resposta simulada para ' + profile);
    if (profile === 'Gerente') {
      await nav('/relatorios', 'Relatórios'); await page.getByRole('button', { name: 'Alerta', exact: true }).click();
      await page.getByLabel('Título do alerta').fill('Alerta novo'); await page.getByLabel('Descrição do alerta').fill('Descrição nova');
    }
  }
  await page.getByRole('link', { name: 'Abrir alerta' }).first().click();
  await visible(page.getByText('Descrição nova', { exact: true }));
  check('abertura por GET /alerts/:id sem gravar leitura fictícia');
  mode = 'empty'; await nav('/alertas', 'Alertas'); await visible(page.getByRole('heading', { name: 'Nenhum alerta registrado' }));
  await nav('/checklists', 'Checklists feitos'); await visible(page.getByRole('heading', { name: 'Nenhum registro encontrado' }));
  mode = 'forbidden'; await nav('/alertas', 'Alertas'); await visible(page.getByRole('alert').filter({ hasText: 'Você não tem permissão' }));
  mode = 'offline'; await nav('/alertas', 'Alertas'); await visible(page.getByRole('alert').filter({ hasText: 'Não foi possível conectar' }));
  mode = 'normal'; await page.getByRole('button', { name: 'Tentar novamente' }).click(); await visible(page.getByRole('link', { name: 'Abrir alerta' }));
  check('estados vazio, sem permissão, rede e recuperação');
  for (const [label, width, height] of [['desktop', 1440, 1000], ['tablet', 820, 1180], ['celular', 390, 844]]) {
    await page.setViewportSize({ width, height });
    await nav('/painel', 'Painel'); await visible(page.getByText('Meus registros de relatório'));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), label + ' sem overflow');
    await page.screenshot({ path: path.join(output, label + '.png'), fullPage: true });
    for (const [route, title] of [['/checklists', 'Checklists feitos'], ['/relatorios', 'Relatórios'], ['/alertas', 'Alertas'], ['/pops', 'POPs'], ['/conteudo', 'Conteúdo educativo']]) {
      await nav(route, title);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), label + ' ' + route);
    }
    if (width < 768) {
      await page.getByRole('button', { name: 'Abrir menu' }).click();
      await visible(page.getByRole('button', { name: 'Fechar menu' }));
      await page.getByRole('link', { name: 'Checklists feitos', exact: true }).click();
      await visible(page.getByRole('heading', { name: 'Checklists feitos', exact: true }));
      await page.locator('.offcanvas-backdrop').waitFor({ state: 'detached' });
      await page.getByRole('button', { name: 'Abrir menu' }).click(); await page.keyboard.press('Escape');
      await page.locator('.offcanvas-backdrop').waitFor({ state: 'detached' });
    }
    check('navegação e responsividade em ' + label);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  mode = 'expired'; await nav('/alertas', 'Alertas');
  await visible(page.getByRole('heading', { name: 'Bem-vindo(a)' }));
  assert.equal(await page.evaluate(() => sessionStorage.getItem('viva.session')), null);
  check('401 expira sessão e redireciona ao login');
  mode = 'normal'; await login(); await visible(page.getByRole('heading', { name: 'Painel', exact: true }));
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await visible(page.getByRole('heading', { name: 'Bem-vindo(a)' }));
  assert.equal(logoutCalls, 1); check('logout remoto e local');
  await login(); await visible(page.getByRole('heading', { name: 'Painel', exact: true }));
  await nav('/ativar-conta', 'Ativar conta temporária');
  await page.getByLabel('Novo usuário', { exact: true }).fill('usuario-novo');
  await page.getByLabel('Nova senha (mínimo de 8 caracteres)').fill('nova-senha');
  await page.getByRole('button', { name: 'Ativar conta', exact: true }).click();
  await visible(page.getByText('Conta ativada. Entre com seu novo usuário e senha.'));
  check('ativação invalida sessão e exige novo login');
  await page.evaluate(() => sessionStorage.setItem('viva.session', '{bad'));
  await page.goto(origin + '/painel'); await visible(page.getByRole('heading', { name: 'Bem-vindo(a)' }));
  check('sessão corrompida não libera rota protegida');
  assert.deepEqual(errors, []); check('sem erros JavaScript no navegador');
  console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
} finally { await browser.close(); }
