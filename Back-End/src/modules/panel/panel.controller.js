const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');
const service = require('./panel.service');

const getPainel = asyncHandler(async (req, res) => ok(res, await service.getPainel(req.auth)));

const trocarPerfil = asyncHandler(async (req, res) =>
  ok(res, await service.trocarPerfil(req.auth, req.body.perfil)));

module.exports = { getPainel, trocarPerfil };
