class HttpError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const badRequest   = (msg = 'Requisicao invalida', d) => new HttpError(400, msg, d);
const unauthorized = (msg = 'Nao autenticado', d)     => new HttpError(401, msg, d);
const forbidden    = (msg = 'Sem permissao', d)       => new HttpError(403, msg, d);
const notFound     = (msg = 'Nao encontrado', d)      => new HttpError(404, msg, d);
const conflict     = (msg = 'Conflito', d)            => new HttpError(409, msg, d);

module.exports = { HttpError, badRequest, unauthorized, forbidden, notFound, conflict };
