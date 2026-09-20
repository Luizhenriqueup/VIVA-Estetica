const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const { unauthorized } = require('../../utils/httpError');

const sign = (user, activeRole) =>
  jwt.sign({ sub: user.id, activeRole: activeRole || user.perfilAtual }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });

const verify = (token) => {
  try {
    return jwt.verify(token, env.jwt.secret);
  } catch {
    throw unauthorized('Token invalido ou expirado');
  }
};

module.exports = { sign, verify };
