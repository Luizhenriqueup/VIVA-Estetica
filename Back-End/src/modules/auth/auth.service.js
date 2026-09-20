const password = require('./password.service');
const token = require('./token.service');
const { unauthorized } = require('../../utils/httpError');

const usuarios = [];

const findByEmail = async (email) => usuarios.find((u) => u.email === email) || null;
const findById = async (id) => usuarios.find((u) => u.id === id) || null;

async function login({ email, senha }) {
  const usuario = await findByEmail(email);
  if (!usuario) throw unauthorized('Email ou senha invalidos');

  const senhaValida = await password.compare(senha, usuario.senhaHash);
  if (!senhaValida) throw unauthorized('Email ou senha invalidos');

  return { token: token.sign(usuario), usuario: toPublico(usuario) };
}

function toPublico(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfilAtual: usuario.perfilAtual,
    perfisPermitidos: usuario.perfisPermitidos,
  };
}

module.exports = { login, findByEmail, findById, toPublico };
