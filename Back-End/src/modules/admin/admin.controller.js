const asyncHandler = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/response');
const service = require('./admin.service');

const listUsers   = asyncHandler(async (req, res) => ok(res, await service.listUsers(req.auth, req.query)));
const createUser  = asyncHandler(async (req, res) => created(res, await service.createUser(req.auth, req.body)));
const promote     = asyncHandler(async (req, res) => ok(res, await service.promote(req.auth, req.params.id, req.body.role)));
const demote      = asyncHandler(async (req, res) => ok(res, await service.demote(req.auth, req.params.id, req.body.role)));
const setFlags    = asyncHandler(async (req, res) => ok(res, await service.setExtraFlags(req.auth, req.params.id, req.body.flagNames)));
const setDisabled = asyncHandler(async (req, res) => ok(res, await service.setDisabled(req.auth, req.params.id, req.body.disabled)));
const reset       = asyncHandler(async (req, res) => ok(res, await service.resetCredentials(req.auth, req.params.id)));
const roles       = asyncHandler(async (req, res) => ok(res, service.assignableRoles(req.auth)));

module.exports = { listUsers, createUser, promote, demote, setFlags, setDisabled, reset, roles };
