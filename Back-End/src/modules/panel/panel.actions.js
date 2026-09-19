const { FLAGS } = require('../../constants/flags');

/**
 * Catalogo das "actions" do HUD lateral.
 * O front renderiza o que vier aqui - o back ja devolve filtrado por flag.
 * TODO: ajustar icones/ordem/rotas junto com quem esta fazendo o painel.
 */
const ACTIONS = [
  { key: 'dashboard',  label: 'Painel',             icon: 'grid',     route: '/painel',      requiredFlags: FLAGS.PANEL_ACCESS,   group: 'principal' },
  { key: 'reports',    label: 'Relatorios',         icon: 'clipboard',route: '/relatorios',  requiredFlags: FLAGS.REPORT_CREATE,  group: 'principal' },
  { key: 'reports_all',label: 'Todos os relatorios',icon: 'layers',   route: '/relatorios/todos', requiredFlags: FLAGS.REPORT_VIEW_ALL, group: 'principal' },
  { key: 'alerts',     label: 'Alertas',            icon: 'bell',     route: '/alertas',     requiredFlags: FLAGS.ALERT_VIEW,     group: 'principal', badge: 'alerts.pending' },
  { key: 'pops',       label: 'POPs',               icon: 'file-pdf', route: '/pops',        requiredFlags: FLAGS.POP_VIEW,       group: 'conteudo' },
  { key: 'education',  label: 'Conteudo educativo', icon: 'play',     route: '/educativo',   requiredFlags: FLAGS.EDU_VIEW,       group: 'conteudo' },
  { key: 'admin',      label: 'Administracao',      icon: 'shield',   route: '/admin',       requiredFlags: FLAGS.ADMIN_USER_VIEW,group: 'gestao' },
];

module.exports = { ACTIONS };
