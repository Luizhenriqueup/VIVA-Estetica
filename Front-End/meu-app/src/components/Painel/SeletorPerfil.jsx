import { resolverPerfis, PERFIS } from "../../constants/perfis";

/**
 * Seletor de perfil.
 *
 * props:
 * - perfilAtual: id do perfil ativo (ex: "GERENTE")
 * - perfisPermitidos: array de ids que o back end liberou para o usuário
 * - onTrocarPerfil: callback(id) chamado ao escolher outro perfil
 *
 * Se o usuário tiver apenas um perfil, o componente vira um rótulo
 * simples — nada de dropdown.
 */
function SeletorPerfil({ perfilAtual, perfisPermitidos = [], onTrocarPerfil}) {
  const opcoes = resolverPerfis(perfisPermitidos);
  const atual = PERFIS[perfilAtual];

  if (opcoes.length <= 1) {
    return (
      <div className="px-3 py-2 rounded">
        <div className="small text-white">Perfil</div>
        <div className="fw-semibold">{atual ? atual.nome : "—"}</div>
      </div>
    );
  }

  return (
    <div className="dropdown">
      <button
        type="button"
        className="btn text-white w-100 text-start dropdown-toggle"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <span className="d-block small opacity-75">Perfil</span>
        <span className="fw-semibold">{atual ? atual.nome : "Selecionar"}</span>
      </button>

      <ul className="dropdown-menu w-100"
      style={{
      "--bs-dropdown-bg": "rgb(36, 53, 42)",
      "--bs-dropdown-color": "#ffffff",
      "--bs-dropdown-link-color": "#ffffff",
      "--bs-dropdown-link-hover-bg": "#5f8a61",
      "--bs-dropdown-link-hover-color": "#ffffff",
      "--bs-dropdown-link-active-bg": "#5f8a61",
      "--bs-dropdown-link-active-color": "#ffffff",
      "--bs-dropdown-border-color": "rgb(52, 78, 62)",
    }}>
        {opcoes.map((perfil) => (
          <li key={perfil.id}>
            <button
              type="button"
              className={
                "dropdown-item" + (perfil.id === perfilAtual ? " active" : "")
              }
              onClick={() => onTrocarPerfil(perfil.id)}
            >
              {perfil.nome}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SeletorPerfil;
