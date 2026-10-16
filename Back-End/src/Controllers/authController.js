import authService from "../services/authService.js";
import { allFlags, isFlag } from "../domain/flags.js";

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function loginAction(req, res) {
  const { username, password } = req.body ?? {};
  
  if (!hasText(username) || !hasText(password)) {
    return res.status(400).json({ message: "Informe usuário e senha." });
  }

  const session = await authService.login({ username: username.trim(), password });
  if (!session) {
    return res.status(401).json({ message: "Usuário ou senha inválidos." });
  }

  res.json(session);
}

async function registerTempLoginAction(req, res) {
  const credentials = await authService.createTemporaryUser();
  res.status(201).json(credentials);
}

async function registerAction(req, res) {
  const { username, password } = req.body ?? {};
  if (
    !hasText(username) ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    return res.status(400).json({
      message: "Informe um novo usuário e uma nova senha com pelo menos 8 caracteres.",
    });
  }

  const user = await authService.registerTemporaryUser(req.auth.userId, {
    username: username.trim(),
    password,
  });

  if (!user) {
    return res.status(409).json({ message: "Esta conta já foi ativada." });
  }

  res.json(user);
}

async function logoutAction(req, res) {
  const deleted = await authService.logout(req.auth.tokenHash);
  if (!deleted) {
    return res.status(401).json({ message: "Token inválido ou já encerrado." });
  }

  res.status(204).end();
}

async function deleteAction(req, res) {
  if (req.params.id !== req.auth.userId) {
    return res.status(403).json({ message: "Você só pode excluir sua própria conta." });
  }

  const deleted = await authService.deleteUser(req.auth.userId);
  if (!deleted) {
    return res.status(404).json({ message: "Usuário não encontrado." });
  }

  res.status(204).end();
}

async function setFlagsAction(req, res) {
  const { userId, flags } = req.body ?? {};

  if (
    !hasText(userId) ||
    !Array.isArray(flags) ||
    flags.some((flag) => !isFlag(flag)) ||
    new Set(flags).size !== flags.length
  ) {
    return res.status(400).json({
      message: "Informe userId e um array de flags válidas sem duplicatas.",
      allowedFlags: allFlags,
    });
  }

  const result = await authService.setFlags(userId.trim(), flags);
  if (result.status === "not-found") {
    return res.status(404).json({ message: "Usuário não encontrado." });
  }
  if (result.status === "temporary-user") {
    return res.status(409).json({ message: "Não é possível definir flags em uma conta temporária." });
  }
  if (result.status === "last-admin") {
    return res.status(409).json({ message: "Não é possível remover a flag do último Admin." });
  }

  res.json(result.user);
}

export default {
  loginAction,
  registerTempLoginAction,
  registerAction,
  logoutAction,
  deleteAction,
  setFlagsAction,
};
