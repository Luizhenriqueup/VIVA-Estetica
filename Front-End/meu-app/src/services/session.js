const KEY = 'viva.session';
export function isValidSession(value, now = Date.now()) {
  return !!value && typeof value.userId === 'string' && value.userId.length > 0 &&
    typeof value.token === 'string' && /^[A-Za-z0-9._~-]+$/.test(value.token) &&
    Number.isFinite(Date.parse(value.expiresAt)) && Date.parse(value.expiresAt) > now &&
    (value.username === undefined || typeof value.username === 'string') &&
    (value.isTemp === undefined || typeof value.isTemp === 'boolean');
}
export function readSession(storage = sessionStorage) {
  try {
    const value = JSON.parse(storage.getItem(KEY));
    if (isValidSession(value)) return value;
    storage.removeItem(KEY);
  } catch { /* Sessão inválida ou armazenamento indisponível. */ }
  return null;
}
export function saveSession(value, storage = sessionStorage) {
  if (!isValidSession(value)) throw new Error('Resposta de autenticação inválida.');
  const session = {
    userId: value.userId,
    token: value.token,
    expiresAt: value.expiresAt,
    ...(typeof value.username === 'string' && value.username.trim() ? { username: value.username.trim() } : {}),
    ...(typeof value.isTemp === 'boolean' ? { isTemp: value.isTemp } : {}),
  };
  try { storage.setItem(KEY, JSON.stringify(session)); }
  catch { throw new Error('Não foi possível guardar a sessão neste navegador. Habilite o armazenamento e tente novamente.'); }
  return session;
}
export function clearSession(storage = sessionStorage) {
  try { storage.removeItem(KEY); } catch { /* O estado em memória também é encerrado. */ }
}
