import SeletorPerfil from "./SeletorPerfil";
import logoViva from '../../assets/logoSinabar.png'
import '../../styles/Painel.css'
import { Link } from "react-router-dom";

const ATALHOS = [
  { id: "relatorios", nome: "Relatórios", icone: "bi-bar-chart" },
  { id: "pops", nome: "POPs", icone: "bi-journal-text" },
  { id: "conteudo", nome: "Conteúdo educativo", icone: "bi-mortarboard" },
];

/**
 * props:
 * - perfilAtual, perfisPermitidos, onTrocarPerfil -> repassados ao seletor
 * - atalhoAtivo: id do atalho selecionado
 * - onAtalho: callback(id) ao clicar num atalho
 */
function Sidebar({
  perfilAtual,
  perfisPermitidos,
  onTrocarPerfil,
  atalhoAtivo,
  onAtalho,
  nomePerfil,
  aberta,
  onFechar,
}) {
  return (
    <aside
      className={
        "sidebar d-flex flex-column flex-shrink-0 p-3 text-white bg-verde vh-100" +
        (aberta ? " sidebar--aberta" : "")
      }
      style={{ width: "260px" }}
    >

      <button
        type="button"
        className="btn-fechar-sidebar d-md-none"
        onClick={onFechar}
        aria-label="Fechar menu"
        >
        <i className="bi bi-x-lg" />
      </button>


      <a href="/">
        <div className="text-center m-3">
          <Link to="/painel" className="">
            <img src={logoViva} className="img-fluid my-2 tamanhoImagem" alt="Vite logo" />
          </Link>
        </div>
      </a>

      <div className="text-center mb-3">{nomePerfil}</div>

      <SeletorPerfil
        perfilAtual={perfilAtual}
        perfisPermitidos={perfisPermitidos}
        onTrocarPerfil={onTrocarPerfil}
      />

      <hr className="text-secondary" />

      <ul className="nav nav-pills flex-column gap-1 mb-auto"
      style={{ "--bs-nav-pills-link-active-bg": "rgb(95, 138, 97)" }}>
        {ATALHOS.map((atalho) => (
          <li key={atalho.id} className="nav-item">
            <button
              type="button"
              className={
                
                "nav-link text-start w-100 " +
                (atalhoAtivo === atalho.id ? "active" : "text-white item-sidebar-proprio")



              }
              onClick={() => onAtalho(atalho.id)}
            >
              <i className={`bi ${atalho.icone} me-2`} aria-hidden="true" />
              {atalho.nome}
            </button>
          </li>
        ))}
      </ul>

      <hr className="text-secondary" />

      <Link to="/" className="btnM btn-outline-verde">
          Sair     
      </Link>
    </aside>
  );
}

export default Sidebar;