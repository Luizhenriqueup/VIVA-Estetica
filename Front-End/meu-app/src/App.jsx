import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Painel/Layout';
import Login from './pages/Login';
import Painel from './pages/Painel';
import Relatorios from './pages/Relatorios';
import Checklists from './pages/Checklists';
import NovoChecklist from './pages/NovoChecklist';
import ChecklistDetalhe from './pages/ChecklistDetalhe';
import Alertas from './pages/Alertas';
import AlertaDetalhe from './pages/AlertaDetalhe';
import POPs from './pages/POPs';
import Conteudo from './pages/Conteudo';
import AtivarConta from './pages/AtivarConta';
import UsuariosTemporarios from './pages/UsuariosTemporarios';
export default function App() {
  return <BrowserRouter><AuthProvider><Routes>
    <Route path="/" element={<Login />} />
    <Route element={<ProtectedRoute />}><Route element={<Layout />}>
      <Route path="/painel" element={<Painel />} />
      <Route path="/relatorios" element={<Relatorios />} />
      <Route path="/checklists" element={<Checklists />} />
      <Route path="/checklists/novo" element={<NovoChecklist />} />
      <Route path="/checklists/:id" element={<ChecklistDetalhe />} />
      <Route path="/alertas" element={<Alertas />} />
      <Route path="/alertas/:id" element={<AlertaDetalhe />} />
      <Route path="/pops" element={<POPs />} />
      <Route path="/conteudo" element={<Conteudo />} />
      <Route path="/ativar-conta" element={<AtivarConta />} />
      <Route path="/usuarios-temporarios" element={<UsuariosTemporarios />} />
    </Route></Route>
    <Route path="*" element={<main className="container py-5"><h1 className="h3">Página não encontrada</h1><Link to="/painel">Voltar ao sistema</Link></main>} />
  </Routes></AuthProvider></BrowserRouter>;
}
