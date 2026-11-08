import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AccountGate from './components/AccountGate';
import Layout from './components/Painel/Layout';
import Login from './pages/Login';
import Painel from './pages/Painel';
import Relatorios from './pages/Relatorios';
import Checklists from './pages/Checklists';
import NovoChecklist from './pages/NovoChecklist';
import ChecklistDetalhe from './pages/ChecklistDetalhe';
import Alertas from './pages/Alertas';
import NovaNotificacao from './pages/NovaNotificacao';
import AlertaDetalhe from './pages/AlertaDetalhe';
import POPs from './pages/POPs';
import Conteudo from './pages/Conteudo';
import UsuariosTemporarios from './pages/UsuariosTemporarios';
export default function App() {
  return (
  <BrowserRouter>
    <AuthProvider>
      <AccountGate>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/ativar-conta"
            element={<Navigate to="/painel" replace />}
          />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/painel" element={<Painel />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/checklists" element={<Checklists />} />
              <Route path="/checklists/novo" element={<NovoChecklist />} />
              <Route path="/checklists/:id" element={<ChecklistDetalhe />} />
              <Route path="/alertas" element={<Alertas />} />
              <Route path="/alertas/novo" element={<NovaNotificacao />} />
              <Route path="/alertas/:id" element={<AlertaDetalhe />} />
              <Route path="/pops" element={<POPs />} />
              <Route path="/conteudo" element={<Conteudo />} />
              <Route
                path="/usuarios-temporarios"
                element={<UsuariosTemporarios />}
              />
            </Route>
          </Route>
          <Route
            path="*"
            element={
              <main className="container py-5">
                <h1 className="h3">Página não encontrada</h1>
                <Link to="/painel">Voltar ao sistema</Link>
              </main>
            }
          />
        </Routes>
      </AccountGate>
    </AuthProvider>
  </BrowserRouter>
);}
