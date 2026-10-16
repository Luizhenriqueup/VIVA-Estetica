export default function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.code === "P2025") {
    return res.status(404).json({ message: "Registro não encontrado." });
  }
  if (error.code === "P2002") {
    return res.status(409).json({ message: "Já existe um registro com esses dados." });
  }
  if (error.code === "P2003") {
    return res.status(409).json({ message: "A operação viola uma relação existente." });
  }
  if (error.code === "P2034") {
    return res.status(409).json({ message: "Conflito ao atualizar as permissões; tente novamente." });
  }

  console.error(error);
  res.status(500).json({ message: "Erro interno do servidor." });
}
