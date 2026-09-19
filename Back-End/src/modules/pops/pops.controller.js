const asyncHandler = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/response');
const service = require('./pops.service');

const list = asyncHandler(async (req, res) => ok(res, await service.list(req.auth, req.query)));
const getById = asyncHandler(async (req, res) => ok(res, await service.getById(req.params.id)));

const download = asyncHandler(async (req, res) => {
  const { filePath, fileName } = await service.resolveFile(req.params.id);
  res.type('application/pdf');
  return res.download(filePath, fileName);
});

const upsert = asyncHandler(async (req, res) =>
  created(res, await service.upsert(req.auth, req.body)));

module.exports = { list, getById, download, upsert };
