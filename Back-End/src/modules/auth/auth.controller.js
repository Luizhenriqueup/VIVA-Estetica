const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');
const service = require('./auth.service');

const login = asyncHandler(async (req, res) => ok(res, await service.login(req.body)));

const setupCredentials = asyncHandler(async (req, res) =>
  ok(res, await service.setupCredentials(req.auth.userId, req.body)));

const changePassword = asyncHandler(async (req, res) =>
  ok(res, await service.changePassword(req.auth.userId, req.body)));

const me = asyncHandler(async (req, res) => ok(res, service.publicUser(req.user)));

const logout = asyncHandler(async (req, res) => ok(res, await service.logout(req.auth.userId)));

module.exports = { login, setupCredentials, changePassword, me, logout };
