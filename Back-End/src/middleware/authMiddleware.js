import { hashToken } from "../application/TokenHasher.js";
import authService from "../services/authService.js";

export default async function authMiddleware(req, res, next) {
  const authorization = req.get("authorization");
  const match = /^Bearer\s+([A-Za-z0-9._~-]+)$/i.exec(authorization ?? "");

  if (!match) {
    return res.status(401).json({ message: "Token Bearer obrigatório ou inválido." });
  }

  const tokenHash = hashToken(match[1]);
  const session = await authService.findActiveToken(tokenHash);
  if (!session) {
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }

  req.auth = {
    userId: session.userId,
    tokenHash,
    flags: session.user.flags,
    isTemp: session.user.isTemp,
  };
  next();
}
