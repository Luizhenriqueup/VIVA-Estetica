const { ATALHOS } = require('./panel.atalhos');
const { ROLES } = require('../../constants/roles');
const authService = require('../auth/auth.service');
const token = require('../auth/token.service');
const { forbidden } = require('../../utils/httpError');

async function getPainel(auth) {
  const usuario = await authService.findById(auth.userId);
  return {
    nome: usuario.nome,
    perfilAtual: auth.activeRole,
    perfisPermitidos: usuario.perfisPermitidos,
    atalhos: ATALHOS,
  };
}

async function trocarPerfil(auth, novoPerfil) {
  const usuario = await authService.findById(auth.userId);
  if (!usuario.perfisPermitidos.includes(novoPerfil)) {
    throw forbidden('Usuario nao possui este perfil');
  }
  usuario.perfilAtual = novoPerfil;
  return { token: token.sign(usuario, novoPerfil), perfilAtual: novoPerfil };
}

module.exports = { getPainel, trocarPerfil, ROLES };
