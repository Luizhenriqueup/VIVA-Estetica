const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');
const service = require('./panel.service');

const getPanel = asyncHandler(async (req, res) => ok(res, await service.getPanel(req.auth)));

const switchRole = asyncHandler(async (req, res) =>
  ok(res, await service.switchRole(req.auth, req.body.role)));

const listRoles = asyncHandler(async (req, res) =>
  ok(res, service.listSwappableRoles(req.auth)));

module.exports = { getPanel, switchRole, listRoles };
