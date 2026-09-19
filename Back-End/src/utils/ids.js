const { randomUUID, randomBytes } = require('node:crypto');

const uuid = () => randomUUID();

/** Senha/usuario temporario gerado na criacao da conta. */
const tempSecret = (size = 6) =>
  randomBytes(size).toString('base64url').slice(0, size).toUpperCase();

module.exports = { uuid, tempSecret };
