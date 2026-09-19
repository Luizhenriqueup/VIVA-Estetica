const { reportsRepo } = require('../../data/db');
const { evaluate, findMissingRequired } = require('./reports.scoring');
const { getQuestions } = require('./reports.questions');
const { badRequest, notFound, forbidden } = require('../../utils/httpError');
const { FLAGS } = require('../../constants/flags');
const { hasAll } = require('../../utils/flags');
const alertsService = require('../alerts/alerts.service');

/** Formulario que o front renderiza. */
const listQuestions = async () => ({ questions: getQuestions() });

async function create(auth, payload) {
  const missing = findMissingRequired(payload.answers);
  if (missing.length) throw badRequest('Responda as perguntas obrigatorias', { missing });

  const result = evaluate(payload.answers);

  const report = await reportsRepo.insert({
    authorId: auth.userId,
    authorRole: auth.activeRole,
    localName: payload.localName || null,
    procedure: payload.procedure || null,
    answers: payload.answers,
    score: result.score,
    priority: result.priority,
    violations: result.violations,
    status: 'ENVIADO',
  });

  // Relatorio critico dispara alerta automatico para gerencia
  if (result.shouldRaiseAlert) {
    await alertsService.createFromReport(report);
  }

  return report;
}

/** Quem tem REPORT_VIEW_ALL ve tudo; o resto so os proprios. */
async function list(auth, query = {}) {
  const canSeeAll = hasAll(auth.flags, FLAGS.REPORT_VIEW_ALL);
  let rows = await reportsRepo.filter((r) => (canSeeAll ? true : r.authorId === auth.userId));

  if (query.priority) rows = rows.filter((r) => r.priority === query.priority);
  if (query.status) rows = rows.filter((r) => r.status === query.status);

  // TODO: paginacao de verdade quando tiver banco
  return { items: rows, total: rows.length };
}

async function getById(auth, id) {
  const report = await reportsRepo.findById(id);
  if (!report) throw notFound('Relatorio nao encontrado');
  if (report.authorId !== auth.userId && !hasAll(auth.flags, FLAGS.REPORT_VIEW_ALL)) {
    throw forbidden('Sem acesso a este relatorio');
  }
  return report;
}

async function remove(auth, id) {
  const okRemoved = await reportsRepo.remove(id);
  if (!okRemoved) throw notFound('Relatorio nao encontrado');
  return { ok: true };
}

/** TODO: gerar CSV/XLSX real (a pesquisadora precisa extrair os dados). */
async function exportAll(auth, format = 'csv') {
  const { items } = await list(auth, {});
  return { format, generatedAt: new Date().toISOString(), rows: items, todo: 'gerar arquivo real' };
}

module.exports = { listQuestions, create, list, getById, remove, exportAll };
