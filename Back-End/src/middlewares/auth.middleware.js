const asyncHandler = require('../utils/asyncHandler');
const { unauthorized } = require('../utils/httpError');
const tokenService = require('../modules/auth/token.service');
const authService = require('../modules/auth/auth.service');

const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) throw unauthorized('Token ausente');

  const payload = tokenService.verify(token);
  const user = await authService.findById(payload.sub);
  if (!user) throw unauthorized('Usuario invalido');

  req.auth = { userId: user.id, activeRole: payload.activeRole || user.perfilAtual };
  req.user = user;
  next();
});

module.exports = { requireAuth };
