/** Formato unico de resposta pro front nao ter que adivinhar. */
const ok = (res, data = null, meta = undefined) =>
  res.json({ success: true, data, ...(meta ? { meta } : {}) });

const created = (res, data = null) =>
  res.status(201).json({ success: true, data });

const fail = (res, status, message, details = null) =>
  res.status(status).json({ success: false, error: { message, details } });

module.exports = { ok, created, fail };
