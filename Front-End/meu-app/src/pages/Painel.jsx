import { useState } from "react";
import Sidebar from "../components/Painel/Sidebar";
import logoViva from '../assets/viva-estetica.png';
import '../styles/Painel.css'


// MOCK: trocar pelos dados do usuário logado vindos do back end.
// Para testar o caso "só funcionário", deixe apenas ["FUNCIONARIO"].
const usuarioMock = {
  nome: "Vanesa",
  perfilAtual: "FUNCIONARIO",
  perfisPermitidos: ["FUNCIONARIO", "GERENTE", "ADMINISTRADOR"],
  //, "GERENTE", "ADMINISTRADOR"
};

function Painel() {
  const [perfilAtual, setPerfilAtual] = useState(usuarioMock.perfilAtual);
  const [nome, setNome] = useState(usuarioMock.nome)
  const [atalhoAtivo, setAtalhoAtivo] = useState(null);
  const [sidebarAberta, setSidebarAberta] = useState(false);

  function handleTrocarPerfil(novoPerfil) {
    setPerfilAtual(novoPerfil);
    // aqui entra a chamada da API para persistir a troca de perfil
  }

  function handleAtalho(id) {
    setAtalhoAtivo(id);
    // aqui entra a navegação (react-router) ou o carregamento do conteúdo
  }

  return (
    <div className="d-flex">

      <button
        type="button"
        className="btn-hamburger d-md-none"
        onClick={() => setSidebarAberta(true)}
        aria-label="Abrir menu"
      >
        <i className="bi bi-list" />
      </button>

      <Sidebar
        perfilAtual={perfilAtual}
        perfisPermitidos={usuarioMock.perfisPermitidos}
        onTrocarPerfil={handleTrocarPerfil}
        atalhoAtivo={atalhoAtivo}
        onAtalho={handleAtalho}
        nomePerfil={nome}
        aberta={sidebarAberta}
        onFechar={() => setSidebarAberta(false)}
      />
    
      <main className="flex-grow-1 p-4">
        <div className="boas-vindas text-center mb-5">
          <p className="saudacao mb-1">Bem-vindo(a), {nome}</p>
          <h1 className="titulo-painel mb-2">Viva Estética Segura</h1>
          <p className="subtitulo text-muted">Escolha uma opção para continuar</p>
        </div>

        <div className="d-flex flex-column flex-xl-row gap-4 gap-xl-5 justify-content-center align-items-center">
          <button className="card-acao">
            <i className="bi bi-bar-chart-fill card-acao__icone" aria-hidden="true" />
            <span className="card-acao__texto">Relatórios</span>
          </button>

          <button className="card-acao">
            <i className="bi bi-journal-text card-acao__icone" aria-hidden="true" />
            <span className="card-acao__texto">POPs</span>
          </button>

          <button className="card-acao">
            <i className="bi bi-mortarboard-fill card-acao__icone" aria-hidden="true" />
            <span className="card-acao__texto">Conteúdo educativo</span>
          </button>
        </div>
      </main>
    </div>
    
  );
}

export default Painel;


{/*
  
  <main className="flex-grow-1 p-4">
        <div className="text-center">
          <h1>Bem vindo(a) {nome}</h1>
          <h1>Você está no Viva Estética Segura</h1>
          <h3>Escolha qual opções você deseja hoje</h3>
          <div className="text-center">
            <div className="d-flex flex-column gap-5 w-50 mx-auto">
              <button className="btnM btn-verde fs-5 pt-3 fw-bold"><p>Relatorios</p></button>
              <button className="btnM btn-verde fs-5 pt-3 fw-bold"><p>POPs</p></button>
              <button className="btnM btn-verde fs-5 pt-3 fw-bold"><p>Conteúdo educativo</p></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  
  */}