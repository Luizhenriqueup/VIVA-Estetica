import reportService from "../services/reportService.js";

async function getAllAction(req, res) {
  res.json(await reportService.getAllForUser(req.auth.userId));
}

async function getByIdAction(req, res) {
  const report = await reportService.getByIdForUser(req.params.id, req.auth.userId);
  if (!report) {
    return res.status(404).json({ message: "Relatório não encontrado." });
  }

  res.json(report);
}

async function createAction(req, res) {
  const report = await reportService.create(req.auth.userId);
  res.status(201).json(report);
}

async function deleteAction(req, res) {
  const deleted = await reportService.remove(req.params.id, req.auth.userId);
  if (!deleted) {
    return res.status(404).json({ message: "Relatório não encontrado." });
  }

  res.status(204).end();
}

export default { getAllAction, getByIdAction, createAction, deleteAction };
