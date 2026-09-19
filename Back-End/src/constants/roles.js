/**
 * Tipos de conta do sistema.
 * ADMINISTRADOR e "oculto": nunca aparece em listagens publicas nem no swap
 * de conta de quem nao possui o papel.
 */
const ROLES = {
  FUNCIONARIO: 'FUNCIONARIO',
  GERENTE: 'GERENTE',
  ADMINISTRADOR: 'ADMINISTRADOR',
};

const ROLE_LABELS = {
  [ROLES.FUNCIONARIO]: 'Funcionario',
  [ROLES.GERENTE]: 'Gerente',
  [ROLES.ADMINISTRADOR]: 'Administrador',
};

/** Papeis que nao devem ser expostos em listagens/seletores genericos. */
const HIDDEN_ROLES = [ROLES.ADMINISTRADOR];

/** Hierarquia (usada em requireMinRole). */
const ROLE_LEVEL = {
  [ROLES.FUNCIONARIO]: 1,
  [ROLES.GERENTE]: 2,
  [ROLES.ADMINISTRADOR]: 3,
};

const isHiddenRole = (role) => HIDDEN_ROLES.includes(role);

module.exports = { ROLES, ROLE_LABELS, HIDDEN_ROLES, ROLE_LEVEL, isHiddenRole };
