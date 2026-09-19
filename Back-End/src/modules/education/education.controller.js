const asyncHandler = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/response');
const service = require('./education.service');

const list    = asyncHandler(async (req, res) => ok(res, await service.list(req.auth)));
const getById = asyncHandler(async (req, res) => ok(res, await service.getById(req.auth, req.params.id)));
const upsert  = asyncHandler(async (req, res) => created(res, await service.upsert(req.auth, req.body)));
const progress = asyncHandler(async (req, res) =>
  ok(res, await service.markProgress(req.auth, req.params.id, req.body)));

module.exports = { list, getById, upsert, progress };
