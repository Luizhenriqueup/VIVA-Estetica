const bcrypt = require('bcryptjs');

const ROUNDS = 10;

const hash = (plain) => bcrypt.hash(plain, ROUNDS);
const compare = (plain, hashed) => bcrypt.compare(plain, hashed || '');

/**
 * Regras minimas da senha definitiva.
 * TODO: alinhar com a pesquisadora (tamanho minimo, simbolos, etc).
 */
const validateStrength = (plain) => {
  const errors = [];
  if (!plain || plain.length < 8) errors.push('Minimo de 8 caracteres');
  if (!/[A-Za-z]/.test(plain || '')) errors.push('Precisa de ao menos uma letra');
  if (!/[0-9]/.test(plain || '')) errors.push('Precisa de ao menos um numero');
  return errors;
};

module.exports = { hash, compare, validateStrength };
