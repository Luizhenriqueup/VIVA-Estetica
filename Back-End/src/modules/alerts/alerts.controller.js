const asyncHandler = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/response');
const service = require('./alerts.service');

const list        = asyncHandler(async (req, res) => ok(res, await service.list(req.auth, req.query)));
const getById     = asyncHandler(async (req, res) => ok(res, await service.getById(req.params.id)));
const create      = asyncHandler(async (req, res) => created(res, await service.create(req.auth, req.body)));
const acknowledge = asyncHandler(async (req, res) => ok(res, await service.acknowledge(req.auth, req.params.id)));
const resolve     = asyncHandler(async (req, res) => ok(res, await service.resolve(req.auth, req.params.id, req.body)));

module.exports = { list, getById, create, acknowledge, resolve };
