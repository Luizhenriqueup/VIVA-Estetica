const path = require('node:path');
const fs = require('node:fs');
const env = require('../../config/env');
const { popsRepo } = require('../../data/db');
const { filterByFlags } = require('../../utils/flags');
const { notFound } = require('../../utils/httpError');

const POPS_DIR = path.resolve(process.cwd(), env.storageDir, 'pops');

/**
 * Lista os POPs no formato de card que o front usa.
 * Ja sai filtrado pelas flags do usuario.
 */
async function list(auth, query = {}) {
  let items = await popsRepo.all();
  if (query.category) items = items.filter((p) => p.category === query.category);

  const visible = filterByFlags(items, auth.flags);

  return {
    items: visible.map(toCard),
    categories: [...new Set(visible.map((p) => p.category))],
    total: visible.length,
  };
}

const toCard = (pop) => ({
  id: pop.id,
  code: pop.code,
  title: pop.title,
  summary: pop.summary,
  category: pop.category,
  version: pop.version,
  updatedAt: pop.updatedAt || pop.createdAt,
  downloadUrl: `/api/pops/${pop.id}/download`,
});

async function getById(id) {
  const pop = await popsRepo.findById(id);
  if (!pop) throw notFound('POP nao encontrado');
  return pop;
}

/**
 * Resolve o caminho do PDF em /storage/pops.
 * O controller usa res.download() com esse retorno.
 * TODO: trocar por URL assinada (S3/Supabase) se sair do disco local.
 */
async function resolveFile(id) {
  const pop = await getById(id);
  const filePath = path.join(POPS_DIR, pop.fileName);
  if (!fs.existsSync(filePath)) {
    throw notFound('Arquivo PDF ainda nao foi enviado para o servidor');
  }
  return { filePath, fileName: pop.fileName, pop };
}

/** TODO: upload real (multer) + versionamento do PDF. */
async function upsert(auth, payload) {
  if (payload.id) return popsRepo.update(payload.id, payload);
  return popsRepo.insert(payload);
}

module.exports = { list, getById, resolveFile, upsert, POPS_DIR };
