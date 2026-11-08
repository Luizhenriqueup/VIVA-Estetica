import reportService from "../services/reportService.js";
import { paginatedResponse, parsePagination } from "../utils/pagination.js";
import { Flags } from "../domain/flags.js";

async function getAllAction(req, res) {
  const pagination = parsePagination(req.query);
  if (!pagination) {
    return res.status(400).json({
      message: "Os parâmetros page e limit devem ser inteiros positivos; limit não pode exceder 100.",
    });
  }

  const { data, total } = await reportService.getAll({
    ...pagination,
    userId: req.auth.userId,
    canViewAll: canViewAllReports(req.auth),
  });
  res.json(paginatedResponse(data, total, pagination));
}

function canViewAllReports(auth) {
  return auth.flags.includes(Flags.ADMIN) ||
    auth.flags.includes(Flags.GERENTE);
}

async function getByIdAction(req, res) {
  const report = await reportService.getByIdForUser(
  req.params.id,
  req.auth.userId,
  canViewAllReports(req.auth),
);
  if (!report) {
    return res.status(404).json({ message: "Relatório não encontrado." });
  }

  res.json(report);
}

async function createAction(req, res) {
  const { nome, questionnaire } = req.body ?? {};
  if (typeof nome !== "string" || nome.trim().length === 0) {
    return res.status(400).json({
      message: "O campo nome deve ser uma string não vazia.",
    });
  }

  if (
    !Array.isArray(questionnaire) ||
    questionnaire.some((answer) => !Number.isSafeInteger(answer) || answer < 0)
  ) {
    return res.status(400).json({
      message: "O campo questionnaire deve ser um array de inteiros não negativos.",
    });
  }

  const report = await reportService.create(
    req.auth.userId,
    nome.trim(),
    questionnaire,
  );
  res.status(201).json(report);
}

async function deleteAction(req, res) {
  const deleted = await reportService.remove(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "Relatório não encontrado." });
  }

  res.status(204).end();
}

async function updateAction(req, res) {
  const { questionnaire } = req.body ?? {};
  if (!Array.isArray(questionnaire) || questionnaire.length !== 21 ||
      !Array.from(questionnaire).every((answer) => Number.isInteger(answer) && answer >= 0 && answer <= 2)) {
    return res.status(400).json({ message: "Informe as 21 respostas válidas do checklist." });
  }

  const report = await reportService.updateQuestionnaire(
    req.params.id,
    req.auth.userId,
    canViewAllReports(req.auth),
    questionnaire,
  );
  if (!report) {
    return res.status(404).json({ message: "Relatório não encontrado." });
  }

  res.json(report);
}

export default { getAllAction, getByIdAction, createAction, deleteAction, updateAction, canViewAllReports };
