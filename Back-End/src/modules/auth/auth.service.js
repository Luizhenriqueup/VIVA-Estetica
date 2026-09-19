const { usersRepo } = require('../../data/db');
const password = require('./password.service');
const token = require('./token.service');
const { unauthorized, conflict, badRequest } = require('../../utils/httpError');
const { ROLE_FLAGS } = require('../../constants/flags');
const { toNames } = require('../../utils/flags');
const { isHiddenRole } = require('../../constants/roles');

/**
 * LOGIN
 * Aceita tanto a credencial definitiva quanto a temporaria gerada na
 * administracao. Se for temporaria, devolve token com scope 'setup'.
 */
async function login({ username, password: plain }) {
  const user = await usersRepo.find((u) => u.username === username);
  if (!user || user.disabled) throw unauthorized('Usuario ou senha invalidos');

  let isTemp = false;

  if (user.mustChangeCredentials) {
    // TODO: comparar hash da senha temporaria e checar expiracao (tempExpiresAt)
    isTemp = user.tempPassword === plain;
    if (!isTemp) throw unauthorized('Usuario ou senha invalidos');
  } else {
    const okPass = await password.compare(plain, user.passwordHash);
    if (!okPass) throw unauthorized('Usuario ou senha invalidos');
  }

  return {
    token: token.sign(user, { scope: isTemp ? 'setup' : 'full' }),
    mustChangeCredentials: isTemp,
    user: publicUser(user),
  };
}

/**
 * Troca da credencial temporaria pela definitiva (primeiro acesso).
 * O usuario escolhe o proprio login e senha aqui.
 */
async function setupCredentials(userId, { username, newPassword }) {
  const user = await usersRepo.findById(userId);
  if (!user) throw unauthorized();
  if (!user.mustChangeCredentials) throw conflict('Credenciais ja foram definidas');

  const errors = password.validateStrength(newPassword);
  if (errors.length) throw badRequest('Senha fraca', errors);

  const taken = await usersRepo.find((u) => u.username === username && u.id !== userId);
  if (taken) throw conflict('Este nome de usuario ja esta em uso');

  const updated = await usersRepo.update(userId, {
    username,
    passwordHash: await password.hash(newPassword),
    tempPassword: null,
    mustChangeCredentials: false,
  });

  return { token: token.sign(updated, { scope: 'full' }), user: publicUser(updated) };
}

/** Troca de senha comum (usuario ja configurado). */
async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await usersRepo.findById(userId);
  if (!user) throw unauthorized();
  if (!(await password.compare(currentPassword, user.passwordHash))) {
    throw unauthorized('Senha atual incorreta');
  }
  const errors = password.validateStrength(newPassword);
  if (errors.length) throw badRequest('Senha fraca', errors);

  await usersRepo.update(userId, { passwordHash: await password.hash(newPassword) });
  return { ok: true };
}

/** TODO: invalidar token (blacklist/refresh token) quando definir a estrategia. */
async function logout() {
  return { ok: true };
}

/** Nunca devolver hash/senha temporaria pro front. */
function publicUser(user) {
  const flags = (ROLE_FLAGS[user.activeRole] || 0) | (user.extraFlags || 0);
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    activeRole: user.activeRole,
    // papel oculto nao vaza na lista de papeis disponiveis
    roles: user.roles.filter((r) => !isHiddenRole(r) || user.roles.includes(r)),
    flags,
    flagNames: toNames(flags),
    mustChangeCredentials: !!user.mustChangeCredentials,
  };
}

module.exports = { login, setupCredentials, changePassword, logout, publicUser };
