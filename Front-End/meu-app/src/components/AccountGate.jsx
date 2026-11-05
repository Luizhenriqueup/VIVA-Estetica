import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import useResource from '../hooks/useResource';
import { ErrorState, Loading } from './Feedback';
import AtivarConta from '../pages/AtivarConta';

export default function AccountGate({ children }) {
  const { session } = useAuth();
  return session ? <AuthenticatedAccount key={session.token}>{children}</AuthenticatedAccount> : children;
}

function AuthenticatedAccount({ children }) {
  const { api, logout } = useAuth();
  const account = useResource(api.me);
  const location = useLocation();
  const [pending, setPending] = useState(false);
  async function handleLogout() {
    setPending(true);
    try { await logout(); } finally { setPending(false); }
  }
  const exit = <button type="button" className="btn btn-outline-success" disabled={pending} onClick={handleLogout}>{pending ? 'Saindo…' : 'Sair'}</button>;

  // Nenhuma tela do sistema é montada antes da confirmação do perfil no servidor.
  if (account.loading || account.error) return <main className="container py-5" style={{ maxWidth: 640 }}>
    {account.loading ? <Loading /> : <ErrorState error={account.error} onRetry={account.reload} />}
    {exit}
  </main>;

  if (account.data.isTemp) {
    if (location.pathname !== '/ativar-conta' || location.search || location.hash) return <Navigate to="/ativar-conta" replace />;
    return <main className="container py-5" style={{ maxWidth: 640 }}>
      <AtivarConta exit={exit} />
    </main>;
  }
  if (location.pathname === '/ativar-conta') return <Navigate to="/painel" replace />;
  return children;
}
