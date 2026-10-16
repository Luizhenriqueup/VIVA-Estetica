import alertService from "../services/alertService.js";

async function getAllAction(req, res) {
  res.json(await alertService.getAll());
}

async function getByIdAction(req, res) {
  const alert = await alertService.getById(req.params.id);
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

  const alert = await alertService.create({ title: title.trim(), message });
  res.status(201).json(alert);
}

async function updateAction(req, res) {
  const { title, message } = req.body ?? {};
  if (title === undefined && message === undefined) {
    return res.status(400).json({ message: "Informe ao menos um campo para atualizar." });
  }
  if (title !== undefined && (typeof title !== "string" || title.trim().length === 0)) {
    return res.status(400).json({ message: "O campo title deve ser um texto não vazio." });
  }
  if (message !== undefined && message !== null && typeof message !== "string") {
    return res.status(400).json({ message: "O campo message deve ser texto ou null." });
  }

  const alert = await alertService.update(req.params.id, {
    ...(title !== undefined ? { title: title.trim() } : {}),
    ...(message !== undefined ? { message } : {}),
  });
  res.json(alert);
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
