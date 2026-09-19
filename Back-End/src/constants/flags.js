/**
 * Sistema de permissoes por FLAGS (bitmask).
 *
 * Cada permissao e um bit. O usuario carrega um inteiro (ex.: 0b1011).
 * Conteudo (POPs, modulos educativos, acoes do painel) declara `requiredFlags`
 * e e filtrado pelo util `utils/flags.js`.
 *
 * Limite seguro: 30 flags (int 32 bits com sinal). Passando disso, migrar
 * para BigInt ou para array de strings.
 */
const { ROLES } = require('./roles');

const FLAGS = {
  // Painel / geral
  PANEL_ACCESS:        1 << 0,
  PANEL_SWAP_ROLE:     1 << 1,

  // Relatorios
  REPORT_VIEW_OWN:     1 << 2,
  REPORT_VIEW_ALL:     1 << 3,
  REPORT_CREATE:       1 << 4,
  REPORT_EXPORT:       1 << 5,
  REPORT_DELETE:       1 << 6,

  // Alertas
  ALERT_VIEW:          1 << 7,
  ALERT_CREATE:        1 << 8,
  ALERT_ACK:           1 << 9,
  ALERT_RESOLVE:       1 << 10,

  // POPs
  POP_VIEW:            1 << 11,
  POP_DOWNLOAD:        1 << 12,
  POP_MANAGE:          1 << 13,

  // Conteudo educativo
  EDU_VIEW:            1 << 14,
  EDU_MANAGE:          1 << 15,

  // Administracao
  ADMIN_USER_VIEW:     1 << 16,
  ADMIN_USER_CREATE:   1 << 17, // gerar login de funcionario
  ADMIN_USER_PROMOTE:  1 << 18, // funcionario -> gerente / criar gerente
  ADMIN_USER_DISABLE:  1 << 19,
  ADMIN_FLAGS_EDIT:    1 << 20, // editar flags avulsas de um usuario
  ADMIN_ROOT:          1 << 21, // exclusivo do administrador oculto
};

/** Presets de flags por tipo de conta. Ajustar conforme o painel evoluir. */
const ROLE_FLAGS = {};

ROLE_FLAGS[ROLES.FUNCIONARIO] =
  FLAGS.PANEL_ACCESS |
  FLAGS.REPORT_VIEW_OWN | FLAGS.REPORT_CREATE |
  FLAGS.ALERT_VIEW | FLAGS.ALERT_CREATE |
  FLAGS.POP_VIEW | FLAGS.POP_DOWNLOAD |
  FLAGS.EDU_VIEW;

ROLE_FLAGS[ROLES.GERENTE] =
  ROLE_FLAGS[ROLES.FUNCIONARIO] |
  FLAGS.PANEL_SWAP_ROLE |
  FLAGS.REPORT_VIEW_ALL | FLAGS.REPORT_EXPORT |
  FLAGS.ALERT_ACK | FLAGS.ALERT_RESOLVE |
  FLAGS.POP_MANAGE | FLAGS.EDU_MANAGE |
  FLAGS.ADMIN_USER_VIEW | FLAGS.ADMIN_USER_CREATE;

ROLE_FLAGS[ROLES.ADMINISTRADOR] =
  ROLE_FLAGS[ROLES.GERENTE] |
  FLAGS.REPORT_DELETE |
  FLAGS.ADMIN_USER_PROMOTE | FLAGS.ADMIN_USER_DISABLE |
  FLAGS.ADMIN_FLAGS_EDIT | FLAGS.ADMIN_ROOT;

module.exports = { FLAGS, ROLE_FLAGS };
