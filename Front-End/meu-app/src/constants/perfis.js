// Perfis disponíveis no sistema.
// `oculto: true` = nunca aparece na lista a menos que o back end
// envie esse perfil dentro de `perfisPermitidos` do usuário logado.
export const PERFIS = {
  FUNCIONARIO: { id: "FUNCIONARIO", nome: "Funcionário", oculto: false },
  GERENTE: { id: "GERENTE", nome: "Gerente", oculto: false },
  ADMINISTRADOR: { id: "ADMINISTRADOR", nome: "Administrador", oculto: true },
};

export const LISTA_PERFIS = Object.values(PERFIS);

// Recebe os ids vindos do back end e devolve os objetos correspondentes.
export function resolverPerfis(ids = []) {
  return ids.map((id) => PERFIS[id]).filter(Boolean);
}
