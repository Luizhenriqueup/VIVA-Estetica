const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const { unauthorized } = require('../../utils/httpError');

/**
 * scope:
 *  - 'setup': token emitido no login temporario. So serve para
 *             POST /api/auth/setup-credentials.
 *  - 'full' : token normal.
 */
const sign = (user, { scope = 'full', activeRole } = {}) =>
  jwt.sign(
    { sub: user.id, activeRole: activeRole || user.activeRole, scope },
    env.jwt.secret,
    { expiresIn: scope === 'setup' ? `${env.tempLoginTtlHours}h` : env.jwt.expiresIn },
  );

const verify = (token) => {
  try {
    return jwt.verify(token, env.jwt.secret);
  } catch {
    throw unauthorized('Token invalido ou expirado');
  }
};

module.exports = { sign, verify };
