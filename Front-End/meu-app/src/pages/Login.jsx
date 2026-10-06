import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/Login/LoginForm';
import { useAuth } from '../contexts/auth';
import '../styles/Login.css';
import logoViva from '../assets/viva-estetica.png';
export default function Login() {
  const { login, session, notice } = useAuth();
  const location = useLocation();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const destination = location.state?.from;
  if (session) return <Navigate to={typeof destination === 'string' && /^\/(painel|relatorios|checklists|alertas|pops|conteudo|ativar-conta)(\/|$)/.test(destination) ? destination : '/painel'} replace />;
  async function handleLogin(credentials) {
    setPending(true); setError('');
    try { await login(credentials); } catch (err) { setError(err.message); } finally { setPending(false); }
  }
  return <div className="screen"><main className="container d-flex align-items-center justify-content-center min-vh-100 py-4">
    <div className="card shadow-sm w-100 bg-light" style={{ maxWidth: 400 }}>
      <div className="text-center mt-4"><img src={logoViva} className="img-fluid tamanhoImagem" alt="Viva Estética Segura" /></div>
      <div className="card-body p-4"><h1 className="h4 mb-1 text-center">Bem-vindo(a)</h1>
        <p className="text-muted text-center">Faça o login para continuar</p>
        {notice && <div className="alert alert-info" role="status">{notice}</div>}
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        <LoginForm onSubmit={handleLogin} pending={pending} />
        <p className="text-center mt-4 mb-0 small text-muted">Para obter acesso, procure o responsável pelo sistema. Se recebeu credenciais temporárias, entre para ativar sua conta.</p>
      </div>
    </div>
  </main></div>;
}
