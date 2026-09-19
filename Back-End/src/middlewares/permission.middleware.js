const { forbidden, unauthorized } = require('../utils/httpError');
const { hasAll, hasAny, toNames } = require('../utils/flags');
const { ROLE_LEVEL } = require('../constants/roles');

/** Exige TODAS as flags. Ex.: requireFlags(FLAGS.REPORT_VIEW_ALL) */
const requireFlags = (...required) => (req, res, next) => {
  if (!req.auth) throw unauthorized();
  if (!hasAll(req.auth.flags, required)) {
    throw forbidden('Sem permissao para esta acao', { required: toNames(required.flat().reduce((a, b) => a | b, 0)) });
  }
  next();
};

/** Exige PELO MENOS UMA das flags. */
const requireAnyFlag = (...required) => (req, res, next) => {
  if (!req.auth) throw unauthorized();
  if (!hasAny(req.auth.flags, required)) throw forbidden('Sem permissao para esta acao');
  next();
};

/** Exige papel ativo especifico. */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.auth) throw unauthorized();
  if (!roles.includes(req.auth.activeRole)) throw forbidden('Tipo de conta invalido para esta acao');
  next();
};

/** Exige papel ativo >= nivel informado. */
const requireMinRole = (role) => (req, res, next) => {
  if (!req.auth) throw unauthorized();
  if ((ROLE_LEVEL[req.auth.activeRole] || 0) < (ROLE_LEVEL[role] || 99)) {
    throw forbidden('Nivel de conta insuficiente');
  }
  next();
};

module.exports = { requireFlags, requireAnyFlag, requireRole, requireMinRole };
