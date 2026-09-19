const { alertsRepo } = require('../../data/db');
const { notFound } = require('../../utils/httpError');

const ALERT_STATUS = { ABERTO: 'ABERTO', EM_TRATATIVA: 'EM_TRATATIVA', RESOLVIDO: 'RESOLVIDO' };
const ALERT_SEVERITY = { INFO: 'INFO', ATENCAO: 'ATENCAO', CRITICO: 'CRITICO' };

/** Alerta gerado automaticamente por relatorio critico. */
async function createFromReport(report) {
  return alertsRepo.insert({
    origin: 'RELATORIO',
    reportId: report.id,
    severity: ALERT_SEVERITY.CRITICO,
    title: 'Relatorio critico de seguranca',
    message: `Relatorio ${report.id} apontou ${report.violations.length} item(ns) inadequado(s) de seguranca.`,
    status: ALERT_STATUS.ABERTO,
    createdBy: report.authorId,
    // TODO: definir destinatario (gerente da unidade? pesquisadora?) e notificar
    assignedTo: null,
  });
}

/** Alerta manual disparado por um usuario. */
async function create(auth, payload) {
  return alertsRepo.insert({
    origin: 'MANUAL',
    reportId: payload.reportId || null,
    severity: payload.severity || ALERT_SEVERITY.ATENCAO,
    title: payload.title,
    message: payload.message,
    status: ALERT_STATUS.ABERTO,
    createdBy: auth.userId,
    assignedTo: null,
  });
}

async function list(auth, query = {}) {
  let rows = await alertsRepo.all();
  if (query.status) rows = rows.filter((a) => a.status === query.status);
  if (query.severity) rows = rows.filter((a) => a.severity === query.severity);
  rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return { items: rows, total: rows.length };
}

async function getById(id) {
  const alert = await alertsRepo.findById(id);
  if (!alert) throw notFound('Alerta nao encontrado');
  return alert;
}

async function acknowledge(auth, id) {
  await getById(id);
  return alertsRepo.update(id, { status: ALERT_STATUS.EM_TRATATIVA, assignedTo: auth.userId });
}

async function resolve(auth, id, { resolution } = {}) {
  await getById(id);
  return alertsRepo.update(id, {
    status: ALERT_STATUS.RESOLVIDO,
    resolvedBy: auth.userId,
    resolvedAt: new Date().toISOString(),
    resolution: resolution || null,
  });
}

/** TODO: integracao de envio (e-mail/WhatsApp) para o destinatario responsavel. */
async function notify(alert) {
  console.log('[alerts] TODO notificar destinatario:', alert.id);
  return { queued: false };
}

module.exports = {
  createFromReport, create, list, getById, acknowledge, resolve, notify,
  ALERT_STATUS, ALERT_SEVERITY,
};
