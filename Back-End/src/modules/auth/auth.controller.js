const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');
const service = require('./auth.service');

const login = asyncHandler(async (req, res) => ok(res, await service.login(req.body)));

const me = asyncHandler(async (req, res) => ok(res, service.toPublico(req.user)));

module.exports = { login, me };
