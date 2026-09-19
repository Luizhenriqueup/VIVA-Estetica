const { FLAGS } = require('../constants/flags');

/** Combina varias flags em um unico inteiro. */
const combine = (...list) => list.flat().reduce((acc, f) => acc | (f || 0), 0);

/** Usuario possui TODAS as flags exigidas? */
const hasAll = (userFlags, required) => (userFlags & combine(required)) === combine(required);

/** Usuario possui PELO MENOS UMA das flags exigidas? */
const hasAny = (userFlags, required) => (userFlags & combine(required)) !== 0;

const add = (userFlags, ...list) => userFlags | combine(list);
const remove = (userFlags, ...list) => userFlags & ~combine(list);

/** Converte inteiro -> nomes legiveis (para debug e para o front montar a UI). */
const toNames = (userFlags) =>
  Object.keys(FLAGS).filter((name) => (userFlags & FLAGS[name]) !== 0);

/** Converte nomes -> inteiro. */
const fromNames = (names = []) =>
  names.reduce((acc, name) => acc | (FLAGS[name] || 0), 0);

/**
 * Filtra uma lista de conteudo pelo campo `requiredFlags`.
 * Itens sem requiredFlags (0/undefined) sao publicos para quem esta logado.
 */
const filterByFlags = (items = [], userFlags = 0, key = 'requiredFlags') =>
  items.filter((item) => !item[key] || hasAll(userFlags, item[key]));

module.exports = { combine, hasAll, hasAny, add, remove, toNames, fromNames, filterByFlags };
