const ok = (res, data = null) => res.json({ success: true, data });
const created = (res, data = null) => res.status(201).json({ success: true, data });
const fail = (res, status, message, details = null) =>
  res.status(status).json({ success: false, error: { message, details } });

module.exports = { ok, created, fail };
