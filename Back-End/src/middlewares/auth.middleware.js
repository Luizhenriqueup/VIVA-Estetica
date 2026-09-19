const asyncHandler = require('../utils/asyncHandler');
const { unauthorized, forbidden } = require('../utils/httpError');
const tokenService = require('../modules/auth/token.service');
const { usersRepo } = require('../data/db');
const { ROLE_FLAGS } = require('../constants/flags');

/**
 * Le o Bearer token, valida e popula req.auth:
 * { userId, activeRole, roles, flags, mustChangeCredentials, scope }
 */
const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) throw unauthorized('Token ausente');

  const payload = tokenService.verify(token); // lanca se invalido/expirado

  const user = await usersRepo.findById(payload.sub);
  if (!user || user.disabled) throw unauthorized('Usuario invalido ou desativado');

  const activeRole = payload.activeRole || user.activeRole;

  req.auth = {
    userId: user.id,
    activeRole,
    roles: user.roles,
    // flags efetivas = preset do papel ativo + flags avulsas dadas pelo admin
    flags: (ROLE_FLAGS[activeRole] || 0) | (user.extraFlags || 0),
    mustChangeCredentials: !!user.mustChangeCredentials,
    scope: payload.scope || 'full', // 'setup' = token de login temporario
  };
  req.user = user;
  next();
});

/**
 * Bloqueia qualquer rota do sistema enquanto o usuario nao definiu
 * usuario/senha definitivos (fluxo de login temporario).
 */
const requireSetupComplete = (req, res, next) => {
  if (!req.auth) throw unauthorized();
  if (req.auth.scope === 'setup' || req.auth.mustChangeCredentials) {
    throw forbidden('Defina usuario e senha definitivos antes de continuar', {
      code: 'SETUP_REQUIRED',
      next: 'POST /api/auth/setup-credentials',
    });
  }
  next();
};

module.exports = { requireAuth, requireSetupComplete };
