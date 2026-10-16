import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Offcanvas } from 'bootstrap';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/auth';
import '../../styles/Painel.css';
export default function Layout() {
  const { logout, session } = useAuth();
  const [pending, setPending] = useState(false);
  const menu = useRef(null);
  const instance = useRef(null);
  const location = useLocation();
  const heading = useRef(null);
  useEffect(() => {
    instance.current = new Offcanvas(menu.current);
    return () => { instance.current?.dispose(); instance.current = null; };
  }, []);
  useEffect(() => { heading.current?.focus(); }, [location.pathname]);
  async function handleLogout() { setPending(true); try { await logout(); } finally { setPending(false); } }
  return <div className="app-layout">
    <a href="#conteudo-principal" className="visually-hidden-focusable skip-link">Pular para o conteúdo</a>
    <aside ref={menu} id="menu-principal" className="offcanvas-md offcanvas-start sidebar text-white bg-verde" tabIndex="-1" aria-labelledby="menu-titulo">
      <div className="offcanvas-header">
        <h2 className="offcanvas-title h5" id="menu-titulo">Menu</h2>
        <button type="button" className="btn-close btn-close-white" aria-label="Fechar menu" onClick={() => instance.current?.hide()} />
      </div>
      <div className="offcanvas-body d-flex flex-column p-3">
        <Sidebar onFechar={() => instance.current?.hide()} onLogout={handleLogout} pending={pending} />
      </div>
    </aside>
    <div className="app-content">
      <header className="app-header d-flex align-items-center gap-3 px-3 px-md-4 py-3">
        <button type="button" className="btn btn-outline-success d-md-none" aria-label="Abrir menu" aria-controls="menu-principal" onClick={() => instance.current?.show()}><i className="bi bi-list" /></button>
        <span className="fw-semibold">Viva Estética Segura</span>
      </header>
      <main id="conteudo-principal" ref={heading} tabIndex="-1" className="container-fluid p-3 p-md-4 p-xl-5"><Outlet /></main>
    </div>
  </div>;
}
