import { useState } from 'react';
import { useAuth } from '../contexts/auth';
import { ErrorState, PageTitle } from '../components/Feedback';
export default function AtivarConta() {
  const { api, endSession } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    if (!username.trim() || password.length < 8) { setError(new Error('Informe um usuário e uma senha com pelo menos 8 caracteres.')); return; }
    setPending(true); setError(null);
    try {
      await api.activate({ username: username.trim(), password });
      endSession('Conta ativada. Entre com seu novo usuário e senha.');
    } catch (err) { setError(err); } finally { setPending(false); }
  }
  return <>
    <PageTitle title="Ativar conta temporária">Use esta opção somente se recebeu credenciais de primeiro acesso.</PageTitle>
    <section className="card border-0 shadow-sm"><div className="card-body p-4">
      <p>Escolha seu usuário definitivo e sua senha. Após a ativação, você precisará entrar novamente. Contas já ativadas não podem ser alteradas por este formulário.</p>
      {error && <ErrorState error={error} />}
      <form onSubmit={submit} aria-busy={pending}><fieldset disabled={pending}>
        <label className="form-label" htmlFor="novo-usuario">Novo usuário</label>
        <input id="novo-usuario" className="form-control mb-3" autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
        <label className="form-label" htmlFor="nova-senha">Nova senha (mínimo de 12 caracteres)</label>
        <input id="nova-senha" className="form-control mb-3" autoComplete="new-password" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="btn btn-verde">{pending ? 'Ativando…' : 'Ativar conta'}</button>
      </fieldset></form>
    </div></section>
  </>;
}
