// Grafia exata de Back-End/src/domain/flags.js; não representa o perfil da sessão.
export const PERFIS = {
  Funcionario: { id: 'Funcionario', nome: 'Funcionário' },
  Gerente: { id: 'Gerente', nome: 'Gerente' },
  Admin: { id: 'Admin', nome: 'Administrador' },
};
export const LISTA_PERFIS = Object.values(PERFIS);
export function resolverPerfis(ids = []) { return ids.map((id) => PERFIS[id]).filter(Boolean); }
