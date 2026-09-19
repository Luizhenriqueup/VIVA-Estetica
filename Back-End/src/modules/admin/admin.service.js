const { usersRepo, auditRepo } = require('../../data/db');
const { ROLES, ROLE_LABELS, isHiddenRole } = require('../../constants/roles');
const { FLAGS } = require('../../constants/flags');
const { hasAll, fromNames, toNames } = require('../../utils/flags');
const { tempSecret } = require('../../utils/ids');
const { conflict, notFound, forbidden, badRequest } = require('../../utils/httpError');
const env = require('../../config/env');

/**
 * Cria conta com LOGIN TEMPORARIO.
 * Gerente cria FUNCIONARIO. Administrador cria FUNCIONARIO ou GERENTE.
 * O usuario recebe usuario+senha provisorios e e obrigado a trocar no 1o acesso.
 */
async function createUser(auth, payload) {
  const role = payload.role || ROLES.FUNCIONARIO;

  if (isHiddenRole(role)) throw forbidden('Nao e possivel criar contas deste tipo por aqui');
  if (role === ROLES.GERENTE && !hasAll(auth.flags, FLAGS.ADMIN_USER_PROMOTE)) {
    throw forbidden('Apenas o administrador pode criar contas de gerente');
  }

  const username = payload.username || `user${Date.now().toString().slice(-5)}`;
  if (await usersRepo.find((u) => u.username === username)) {
    throw conflict('Nome de usuario ja em uso');
  }

  const temp = tempSecret(8);

  const user = await usersRepo.insert({
    name: payload.name,
    username,
    passwordHash: null,
    tempPassword: temp, // TODO: guardar hash e nao texto puro
    tempExpiresAt: new Date(Date.now() + env.tempLoginTtlHours * 3600_000).toISOString(),
    mustChangeCredentials: true,
    roles: [role],
    activeRole: role,
    extraFlags: 0,
    disabled: false,
    createdBy: auth.userId,
  });

  await log(auth, 'USER_CREATE', { targetId: user.id, role });

  // Retorna a credencial provisoria UMA vez para o admin repassar
  return {
    user: sanitize(user),
    temporaryCredentials: { username, password: temp, expiresAt: user.tempExpiresAt },
  };
}

/** Promove funcionario -> gerente (mantem o papel antigo para o swap). */
async function promote(auth, userId, targetRole = ROLES.GERENTE) {
  if (isHiddenRole(targetRole)) throw forbidden('Papel indisponivel');
  const user = await usersRepo.findById(userId);
  if (!user) throw notFound('Usuario nao encontrado');
  if (user.roles.includes(targetRole)) throw conflict('Usuario ja possui este tipo de conta');

  const updated = await usersRepo.update(userId, {
    roles: [...user.roles, targetRole],
    activeRole: targetRole,
  });
  await log(auth, 'USER_PROMOTE', { targetId: userId, targetRole });
  return sanitize(updated);
}

/** Remove um papel (rebaixar). */
async function demote(auth, userId, role) {
  const user = await usersRepo.findById(userId);
  if (!user) throw notFound('Usuario nao encontrado');
  const roles = user.roles.filter((r) => r !== role);
  if (!roles.length) throw badRequest('Usuario precisa ter ao menos um tipo de conta');

  const updated = await usersRepo.update(userId, {
    roles,
    activeRole: roles.includes(user.activeRole) ? user.activeRole : roles[0],
  });
  await log(auth, 'USER_DEMOTE', { targetId: userId, role });
  return sanitize(updated);
}

/** Flags avulsas fora do preset do papel (so administrador). */
async function setExtraFlags(auth, userId, flagNames = []) {
  const user = await usersRepo.findById(userId);
  if (!user) throw notFound('Usuario nao encontrado');
  const updated = await usersRepo.update(userId, { extraFlags: fromNames(flagNames) });
  await log(auth, 'USER_FLAGS', { targetId: userId, flagNames });
  return sanitize(updated);
}

async function setDisabled(auth, userId, disabled) {
  const user = await usersRepo.findById(userId);
  if (!user) throw notFound('Usuario nao encontrado');
  if (user.id === auth.userId) throw badRequest('Nao e possivel desativar a propria conta');
  const updated = await usersRepo.update(userId, { disabled: !!disabled });
  await log(auth, disabled ? 'USER_DISABLE' : 'USER_ENABLE', { targetId: userId });
  return sanitize(updated);
}

/** Gera nova credencial temporaria (esqueci a senha / reset). */
async function resetCredentials(auth, userId) {
  const user = await usersRepo.findById(userId);
  if (!user) throw notFound('Usuario nao encontrado');
  const temp = tempSecret(8);
  await usersRepo.update(userId, {
    tempPassword: temp,
    passwordHash: null,
    mustChangeCredentials: true,
    tempExpiresAt: new Date(Date.now() + env.tempLoginTtlHours * 3600_000).toISOString(),
  });
  await log(auth, 'USER_RESET', { targetId: userId });
  return { temporaryCredentials: { username: user.username, password: temp } };
}

/** Contas ocultas (administrador) nao aparecem para quem nao e administrador. */
async function listUsers(auth, query = {}) {
  const isAdmin = hasAll(auth.flags, FLAGS.ADMIN_ROOT);
  let rows = await usersRepo.all();
  if (!isAdmin) rows = rows.filter((u) => !u.roles.some(isHiddenRole));
  if (query.role) rows = rows.filter((u) => u.roles.includes(query.role));
  return { items: rows.map(sanitize), total: rows.length };
}

/** Papeis que este usuario pode atribuir ao criar contas. */
function assignableRoles(auth) {
  const roles = [ROLES.FUNCIONARIO];
  if (hasAll(auth.flags, FLAGS.ADMIN_USER_PROMOTE)) roles.push(ROLES.GERENTE);
  return roles.map((role) => ({ role, label: ROLE_LABELS[role] }));
}

function sanitize(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    roles: user.roles,
    activeRole: user.activeRole,
    extraFlagNames: toNames(user.extraFlags || 0),
    mustChangeCredentials: !!user.mustChangeCredentials,
    disabled: !!user.disabled,
    createdAt: user.createdAt,
  };
}

const log = (auth, action, meta) =>
  auditRepo.insert({ actorId: auth.userId, actorRole: auth.activeRole, action, meta });

module.exports = {
  createUser, promote, demote, setExtraFlags, setDisabled,
  resetCredentials, listUsers, assignableRoles,
};
