import { isFlag } from "../domain/flags.js";

export default function flagMiddleware(requiredFlags) {
  const flags = Array.isArray(requiredFlags) ? requiredFlags : [requiredFlags];

  if (
    flags.length === 0 ||
    flags.some((flag) => !isFlag(flag))
  ) {
    throw new TypeError("Informe uma ou mais flags válidas para a rota.");
  }

  return function authorizeByFlag(req, res, next) {
    if (!req.auth) {
      return res.status(401).json({ message: "Autenticação obrigatória." });
    }

    if (req.auth.isTemp || !flags.some((flag) => req.auth.flags.includes(flag))) {
      return res.status(403).json({ message: "Você não tem permissão para esta operação." });
    }

    next();
  };
}