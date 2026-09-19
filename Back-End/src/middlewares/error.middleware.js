const env = require('../config/env');
const { fail } = require('../utils/response');

const notFoundHandler = (req, res) =>
  fail(res, 404, `Rota nao encontrada: ${req.method} ${req.originalUrl}`);

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) console.error('[erro]', err);
  return fail(
    res,
    status,
    status >= 500 ? 'Erro interno no servidor' : err.message,
    err.details || (env.nodeEnv === 'development' && status >= 500 ? err.stack : null),
  );
};

module.exports = { notFoundHandler, errorHandler };
