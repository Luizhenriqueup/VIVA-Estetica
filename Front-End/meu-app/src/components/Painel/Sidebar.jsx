import { NavLink } from 'react-router-dom';
/*import SeletorPerfil from './SeletorPerfil';*/
import logoViva from '../../assets/logoSinabar.png';
const ATALHOS = [
  { id: 'painel', nome: 'Painel', icone: 'bi-grid' },
  { id: 'relatorios', nome: 'Relatórios', icone: 'bi-bar-chart' },
  { id: 'checklists', nome: 'Checklists feitos', icone: 'bi-check2-square' },
  { id: 'alertas', nome: 'Notificações', icone: 'bi-bell' },
  { id: 'usuarios-temporarios', nome: 'Usuários Temporários', icone: 'bi-person-plus' },
  { id: 'pops', nome: 'POPs', icone: 'bi-journal-text' },
  { id: 'conteudo', nome: 'Conteúdo educativo', icone: 'bi-mortarboard' },
];
export default function Sidebar({ onFechar, onLogout, pending }) {
  return <>
    <div className="text-center my-3">
      <NavLink to="/painel" onClick={onFechar}>
        <img src={logoViva} className="img-fluid tamanhoImagem" alt="Viva Estética Segura" />
      </NavLink>
    </div>
    {/*}<SeletorPerfil />{*/}
    <hr />
    <nav aria-label="Navegação principal" className="nav nav-pills flex-column gap-1 mb-auto">
      {ATALHOS.map((item) => <NavLink key={item.id} to={'/' + item.id} onClick={onFechar}
        className={({ isActive }) => 'nav-link text-white ' + (isActive ? 'active' : 'item-sidebar-proprio')}>
        <i className={'bi ' + item.icone + ' me-2'} aria-hidden="true" />{item.nome}
      </NavLink>)}
    </nav>
    <hr />
    <NavLink to="/ativar-conta" onClick={onFechar} className="small text-white text-center mb-3">Ativar conta temporária</NavLink>
    <button className="btnM btn-outline-verde" disabled={pending} onClick={onLogout}>{pending ? 'Saindo…' : 'Sair'}</button>
  </>;
}
