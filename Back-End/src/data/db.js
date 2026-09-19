/**
 * CAMADA DE DADOS - PLACEHOLDER EM MEMORIA.
 *
 * Aqui e o unico lugar que precisa mudar quando escolherem o banco
 * (Prisma + Postgres, Mongoose, etc). Os services so conhecem os
 * repositorios abaixo, nunca o banco direto.
 */
const { uuid } = require('../utils/ids');

const tables = {
  users: [],
  credentials: [],   // hash de senha separado do usuario
  reports: [],
  alerts: [],
  pops: [],
  educationItems: [],
  auditLog: [],
};

/** Repositorio generico bem burro, so pra estrutura rodar. */
function createRepo(table) {
  return {
    all: async () => [...tables[table]],
    find: async (predicate) => tables[table].find(predicate) || null,
    filter: async (predicate) => tables[table].filter(predicate),
    findById: async (id) => tables[table].find((r) => r.id === id) || null,
    insert: async (data) => {
      const row = { id: data.id || uuid(), createdAt: new Date().toISOString(), ...data };
      tables[table].push(row);
      return row;
    },
    update: async (id, patch) => {
      const row = tables[table].find((r) => r.id === id);
      if (!row) return null;
      Object.assign(row, patch, { updatedAt: new Date().toISOString() });
      return row;
    },
    remove: async (id) => {
      const i = tables[table].findIndex((r) => r.id === id);
      if (i < 0) return false;
      tables[table].splice(i, 1);
      return true;
    },
  };
}

module.exports = {
  tables,
  usersRepo: createRepo('users'),
  credentialsRepo: createRepo('credentials'),
  reportsRepo: createRepo('reports'),
  alertsRepo: createRepo('alerts'),
  popsRepo: createRepo('pops'),
  educationRepo: createRepo('educationItems'),
  auditRepo: createRepo('auditLog'),
};
