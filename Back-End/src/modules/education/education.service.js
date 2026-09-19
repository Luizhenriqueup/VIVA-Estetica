const { educationRepo } = require('../../data/db');
const { filterByFlags } = require('../../utils/flags');
const { notFound, badRequest } = require('../../utils/httpError');

/** Aceita ID puro ou URL do YouTube e devolve so o ID. */
function parseYoutubeId(input = '') {
  if (/^[\w-]{11}$/.test(input)) return input;
  const m = input.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  if (!m) throw badRequest('Link do YouTube invalido');
  return m[1];
}

const toEmbed = (item) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  order: item.order,
  durationMin: item.durationMin,
  provider: item.provider,
  youtubeId: item.youtubeId,
  // o front so joga isso num <iframe>
  embedUrl: `https://www.youtube-nocookie.com/embed/${item.youtubeId}`,
  thumbnailUrl: `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`,
});

async function list(auth) {
  const items = await educationRepo.all();
  const visible = filterByFlags(items, auth.flags).sort((a, b) => (a.order || 0) - (b.order || 0));
  return { items: visible.map(toEmbed), total: visible.length };
}

async function getById(auth, id) {
  const item = await educationRepo.findById(id);
  if (!item) throw notFound('Modulo nao encontrado');
  return toEmbed(item);
}

async function upsert(auth, payload) {
  const data = { ...payload, provider: 'youtube', youtubeId: parseYoutubeId(payload.youtubeId || payload.url || '') };
  if (payload.id) return educationRepo.update(payload.id, data);
  return educationRepo.insert(data);
}

/** TODO: marcar progresso do usuario (assistido/concluido) se entrar no escopo. */
async function markProgress(auth, id, payload) {
  return { itemId: id, userId: auth.userId, progress: payload.progress ?? 0, todo: true };
}

module.exports = { list, getById, upsert, markProgress, parseYoutubeId };
