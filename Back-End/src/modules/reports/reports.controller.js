const asyncHandler = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/response');
const service = require('./reports.service');

const questions = asyncHandler(async (req, res) => ok(res, await service.listQuestions()));
const create    = asyncHandler(async (req, res) => created(res, await service.create(req.auth, req.body)));
const list      = asyncHandler(async (req, res) => ok(res, await service.list(req.auth, req.query)));
const getById   = asyncHandler(async (req, res) => ok(res, await service.getById(req.auth, req.params.id)));
const remove    = asyncHandler(async (req, res) => ok(res, await service.remove(req.auth, req.params.id)));
const exportAll = asyncHandler(async (req, res) => ok(res, await service.exportAll(req.auth, req.query.format)));

module.exports = { questions, create, list, getById, remove, exportAll };
