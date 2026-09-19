const { badRequest } = require('../utils/httpError');

/**
 * Validacao de payload. Hoje aceita um schema zod opcional;
 * se nao passar schema, so segue o fluxo.
 * TODO: criar os schemas de cada modulo em *.schema.js
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  if (!schema) return next();
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return next(badRequest('Dados invalidos', result.error.issues));
  }
  req[source] = result.data;
  next();
};

module.exports = validate;
