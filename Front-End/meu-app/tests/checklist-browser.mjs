// Teste de interface com API simulada: não acessa nem modifica o banco real.
// Requer Vite em TEST_BASE_URL (padrão http://127.0.0.1:4173), Playwright e navegador.
// PLAYWRIGHT_MODULE e BROWSER_EXECUTABLE permitem usar ferramentas já instaladas.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { QUESTIONS, STAGES } from '../src/data/checklist.js';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const origin = process.env.TEST_BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.setDefaultTimeout(10000);
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
let mode = 'normal', createCalls = 0, lastPayload, reads = 0;
const records = [];
await context.route('**/*', async (route) => {
  const request = route.request();
  const url = new URL(request.url());
  if (url.origin !== origin) return route.abort();
  if (!/^\/(auth|reports|alerts)(\/|$)/.test(url.pathname)) return route.continue();
  const respond = (status, data) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
  if (url.pathname === '/auth/login') return respond(200, { userId: 'test-user', token: 'test-session-token', expiresAt: new Date(Date.now() + 3600000).toISOString() });
  assert.equal(request.headers().authorization, 'Bearer test-session-token');
  if (url.pathname === '/auth/logout') return route.fulfill({ status: 204 });
  if (url.pathname === '/alerts') return respond(200, []);
  if (url.pathname === '/reports' && request.method() === 'POST') {
    createCalls++; lastPayload = request.postDataJSON();
    if (mode === 'failure') return respond(500, { message: 'Falha de gravação de teste.' });
    if (mode === 'forbidden') return respond(403, { message: 'Você não tem permissão para esta operação.' });
    await new Promise((resolve) => setTimeout(resolve, 500));
    const report = { id: 'checklist-test-' + createCalls, userId: 'test-user', ...lastPayload };
    records.push(report);
    return respond(201, report);
  }
  if (mode === 'expired') return respond(401, { message: 'Token inválido ou expirado.' });
  if (url.pathname === '/reports') { reads++; return respond(200, [...records, { id: 'incompativel', userId: 'test-user', questionnaire: [] }]); }
  if (url.pathname.startsWith('/reports/')) {
    reads++;
    const report = records.find((item) => item.id === decodeURIComponent(url.pathname.split('/').at(-1)));
    return report ? respond(200, report) : respond(404, { message: 'Relatório não encontrado.' });
  }
  throw new Error('Rota inesperada: ' + url.pathname);
});
const visible = (locator) => locator.waitFor({ state: 'visible' });
async function login() {
  await page.goto(origin + '/');
  await page.getByLabel('Usuário', { exact: true }).fill('teste');
  await page.getByLabel('Senha', { exact: true }).fill('senha-do-teste');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await visible(page.getByRole('heading', { name: 'Painel', exact: true }));
}
try {
  await page.goto(origin + '/checklists/novo');
  await visible(page.getByRole('heading', { name: 'Bem-vindo(a)' }));
  await login();
  await page.goto(origin + '/relatorios');
  await page.getByRole('button', { name: /Fazer Checklist/ }).click();
  await page.getByRole('button', { name: 'Iniciar Checklist', exact: true }).click();
  await visible(page.getByRole('alert').filter({ hasText: 'Informe o nome do paciente' }));
  assert.equal(await page.getByRole('radio').count(), 0);
  await page.getByLabel('Nome do paciente (obrigatório)', { exact: true }).fill('   ');
  await page.getByRole('button', { name: 'Iniciar Checklist', exact: true }).click();
  await visible(page.getByRole('alert').filter({ hasText: 'Informe o nome do paciente' }));
  await page.getByLabel('Nome do paciente (obrigatório)', { exact: true }).fill('  Paciente de teste  ');
  await page.getByRole('button', { name: 'Iniciar Checklist', exact: true }).click();
  assert.equal(await page.locator('textarea').count(), 0);
  const expected = [];
  for (let index = 0; index < QUESTIONS.length; index++) {
    const question = QUESTIONS[index];
    await visible(page.getByText('Paciente: Paciente de teste', { exact: true }));
    await visible(page.getByRole('heading', { name: question.text, exact: true }));
    assert.equal(await page.locator('.checklist-critical').count(), question.critical ? 1 : 0);
    assert.equal(await page.getByRole('radio').count(), 3);
    assert.equal(await page.locator('[aria-current="step"]').getByText(STAGES[question.stageIndex].name, { exact: true }).count(), 1);
    const buttonName = index === 20 ? 'Enviar Checklist' : 'Próximo';
    assert.equal(await page.getByRole('button', { name: buttonName, exact: true }).isDisabled(), true);
    if (index === 8) {
      await page.getByRole('button', { name: 'Voltar', exact: true }).click();
      assert.equal(await page.getByRole('radio').nth(expected[7]).isChecked(), true);
      expected[7] = 2;
      await page.getByRole('radio').nth(2).check();
      await page.getByRole('button', { name: 'Próximo', exact: true }).click();
    }
    expected[index] = index % 3;
    await page.getByRole('radio').nth(expected[index]).check();
    if (index < 20) await page.getByRole('button', { name: 'Próximo', exact: true }).click();
  }
  assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'), '21');
  console.log('PASS: 21 perguntas, validação, seis itens críticos, transições, voltar e editar entre etapas');
  mode = 'failure';
  await page.getByRole('button', { name: 'Enviar Checklist', exact: true }).click();
  await visible(page.getByRole('alert').filter({ hasText: 'Falha de gravação' }));
  assert.equal(await page.getByRole('dialog').count(), 0);
  assert.equal(await page.getByRole('radio').nth(expected[20]).isChecked(), true);
  mode = 'forbidden';
  await page.getByRole('button', { name: 'Enviar Checklist', exact: true }).click();
  await visible(page.getByRole('alert').filter({ hasText: 'Você não tem permissão' }));
  mode = 'normal';
  await page.locator('form').evaluate((form) => { form.requestSubmit(); form.requestSubmit(); });
  await visible(page.getByRole('button', { name: 'Enviando…' }));
  assert.equal(await page.getByRole('button', { name: 'Voltar', exact: true }).isDisabled(), true);
  await visible(page.getByRole('dialog'));
  assert.equal(createCalls, 3);
  assert.equal(records.length, 1);
  assert.deepEqual(lastPayload, { nome: 'Paciente de teste', questionnaire: expected });
  await visible(page.getByRole('dialog').getByRole('heading', { name: 'Checklist realizado com sucesso!' }));
  await visible(page.getByRole('dialog').getByText(/Confirmação neste dispositivo:/));
  await page.getByRole('dialog').getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.getByRole('link', { name: 'Ver respostas', exact: true }).click();
  await visible(page.getByRole('heading', { name: 'Respostas do checklist', exact: true }));
  await visible(page.getByRole('heading', { name: QUESTIONS[20].text, exact: true }));
  await visible(page.getByText('Paciente: Paciente de teste', { exact: true }));
  assert.equal(await page.locator('.checklist-detail-list li').count(), 21);
  assert.deepEqual(await page.locator('.checklist-detail-list strong').allTextContents(), expected.map((code) => ['Adequado', 'Parcial', 'Inadequado'][code]));
  console.log('PASS: erros 500/403 preservam respostas, bloqueio de envio duplo, payload exato, confirmação e detalhes');
  const priorReads = reads;
  await page.reload();
  await visible(page.getByRole('heading', { name: QUESTIONS[20].text, exact: true }));
  await visible(page.getByText('Paciente: Paciente de teste', { exact: true }));
  assert.ok(reads > priorReads);
  assert.equal(await page.getByText(/Confirmação neste dispositivo:/).count(), 0);
  await page.goto(origin + '/checklists');
  await visible(page.getByRole('link', { name: /Ver respostas do checklist/ }));
  assert.equal(await page.getByRole('link', { name: /Ver respostas do checklist/ }).count(), 1);
  records.push({ id: 'antigo-sem-nome', userId: 'test-user', questionnaire: Array(21).fill(0) });
  await page.reload();
  await visible(page.getByText('Paciente: Paciente não informado', { exact: true }));
  await visible(page.getByText('Paciente: Paciente de teste', { exact: true }));
  await page.getByRole('link', { name: 'Ver respostas do checklist antigo-sem-nome', exact: true }).click();
  await visible(page.getByText('Paciente: Paciente não informado', { exact: true }));
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await visible(page.getByRole('heading', { name: 'Bem-vindo(a)' }));
  await login(); await page.goto(origin + '/checklists');
  await visible(page.getByRole('link', { name: /Ver respostas do checklist/ }).first());
  console.log('PASS: histórico recarregado da API simulada após refresh e novo login, sem data persistida');
  await mkdir('test-results', { recursive: true });
  for (const [label, width, height] of [['desktop', 1440, 1000], ['tablet', 820, 1180], ['celular', 390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto(origin + '/checklists/novo');
    await page.getByLabel('Nome do paciente (obrigatório)', { exact: true }).fill('Paciente de teste');
    await page.getByRole('button', { name: 'Iniciar Checklist', exact: true }).click();
    await page.getByRole('radio', { name: 'Adequado', exact: true }).check();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: `test-results/checklist-${label}.png`, fullPage: true });
    await page.goto(origin + '/checklists/' + records[0].id);
    await visible(page.getByRole('heading', { name: QUESTIONS[20].text, exact: true }));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    console.log('PASS: checklist e histórico responsivos em ' + label);
  }
  await page.goto(origin + '/checklists/inexistente');
  await visible(page.getByRole('alert').filter({ hasText: 'Relatório não encontrado' }));
  mode = 'expired'; await page.goto(origin + '/checklists');
  await visible(page.getByRole('heading', { name: 'Bem-vindo(a)' }));
  assert.deepEqual(errors, []);
  console.log('PASS: 404, expiração de sessão e ausência de erros JavaScript');
} finally { await browser.close(); }
