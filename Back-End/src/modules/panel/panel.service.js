const { ACTIONS } = require('./panel.actions');
const { filterByFlags, toNames } = require('../../utils/flags');
const { ROLE_FLAGS } = require('../../constants/flags');
const { ROLE_LABELS, isHiddenRole } = require('../../constants/roles');
const { usersRepo, alertsRepo, reportsRepo } = require('../../data/db');
const { forbidden } = require('../../utils/httpError');
const token = require('../auth/token.service');

/** Monta o HUD: acoes visiveis + papeis disponiveis para swap + contadores. */
async function getPanel(auth) {
  const actions = filterByFlags(ACTIONS, auth.flags);

  return {
    activeRole: auth.activeRole,
    activeRoleLabel: ROLE_LABELS[auth.activeRole],
    flags: auth.flags,
    flagNames: toNames(auth.flags),
    actions,
    availableRoles: listSwappableRoles(auth),
    counters: await getCounters(auth), // TODO: contadores reais
  };
}

/**
 * Papeis que o usuario pode assumir.
 * ADMINISTRADOR so aparece se ele realmente tiver esse papel (oculto p/ o resto).
 */
function listSwappableRoles(auth) {
  return auth.roles
    .filter((role) => !isHiddenRole(role) || auth.roles.includes(role))
    .map((role) => ({
      role,
      label: ROLE_LABELS[role],
      hidden: isHiddenRole(role),
      active: role === auth.activeRole,
      flagNames: toNames(ROLE_FLAGS[role] || 0),
    }));
}

/**
 * Swap rapido de tipo de conta.
 * Nao cria permissao nova: so "desce/sobe" dentro do que o usuario ja possui.
 * Emite um token novo com o activeRole atualizado.
 */
async function switchRole(auth, targetRole) {
  if (!auth.roles.includes(targetRole)) throw forbidden('Voce nao possui este tipo de conta');

  const user = await usersRepo.update(auth.userId, { activeRole: targetRole });
  // TODO: registrar no auditLog quem trocou de papel e quando
  return {
    token: token.sign(user, { scope: 'full', activeRole: targetRole }),
    activeRole: targetRole,
    flagNames: toNames((ROLE_FLAGS[targetRole] || 0) | (user.extraFlags || 0)),
  };
}

async function getCounters(auth) {
  const alerts = await alertsRepo.filter((a) => a.status === 'ABERTO');
  const reports = await reportsRepo.all();
  return {
    alertsPending: alerts.length,
    reportsTotal: reports.length,
    reportsCritical: reports.filter((r) => r.priority === 'CRITICO').length,
  };
}

module.exports = { getPanel, switchRole, listSwappableRoles };
