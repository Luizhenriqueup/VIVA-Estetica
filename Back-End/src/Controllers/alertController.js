import alertService from "../services/alertService.js";
import { paginatedResponse, parsePagination } from "../utils/pagination.js";
import { Flags } from "../domain/flags.js";

function canViewAllAlerts(auth) {
  return !auth.isTemp && (
    auth.flags.includes(Flags.ADMIN) ||
    auth.flags.includes(Flags.GERENTE) ||
    auth.flags.includes(Flags.FUNCIONARIO)
  );
}

async function getAllAction(req, res) {
  const pagination = parsePagination(req.query);
  if (!pagination) {
    return res.status(400).json({
      message: "Os parâmetros page e limit devem ser inteiros positivos; limit não pode exceder 100.",
    });
  }

  const { data, total } = await alertService.getAll({
    ...pagination,
    userId: req.auth.userId,
    canViewAll: canViewAllAlerts(req.auth),
  });
  res.json(paginatedResponse(data, total, pagination));
}

async function getByIdAction(req, res) {
  const alert = await alertService.getById(req.params.id, {
    userId: req.auth.userId,
    canViewAll: canViewAllAlerts(req.auth),
  });
  if (!alert) {
    return res.status(404).json({ message: "Alerta não encontrado." });
  }

  res.json(alert);
}

async function createAction(req, res) {
  const { title, message } = req.body ?? {};
  if (typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({ message: "O campo title é obrigatório." });
  }
  if (message !== undefined && message !== null && typeof message !== "string") {
    return res.status(400).json({ message: "O campo message deve ser texto ou null." });
  }

  const alert = await alertService.create(req.auth.userId, { title: title.trim(), message });
  res.status(201).json(alert);
}

async function updateAction(req, res) {
  const { title, message, resolved } = req.body ?? {};
  if (title === undefined && message === undefined && resolved === undefined) {
    return res.status(400).json({ message: "Informe ao menos um campo para atualizar." });
  }
  if (title !== undefined && (typeof title !== "string" || title.trim().length === 0)) {
    return res.status(400).json({ message: "O campo title deve ser um texto não vazio." });
  }
  if (message !== undefined && message !== null && typeof message !== "string") {
    return res.status(400).json({ message: "O campo message deve ser texto ou null." });
  }
  if (resolved !== undefined && typeof resolved !== "boolean") {
    return res.status(400).json({ message: "O campo resolved deve ser booleano." });
  }

  try {
    const alert = await alertService.update(req.params.id, {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(message !== undefined ? { message } : {}),
      ...(resolved !== undefined ? { resolved } : {}),
    });
    res.json(alert);
  } catch (error) {
    if (error.code !== "P2025") throw error;
    return res.status(404).json({ message: "Alerta não encontrado." });
  }
}

async function deleteAction(req, res) {
  const alert = await alertService.remove(req.params.id);
  res.json(alert);
}

export default {
  getAllAction,
  getByIdAction,
  createAction,
  updateAction,
  deleteAction,
};
