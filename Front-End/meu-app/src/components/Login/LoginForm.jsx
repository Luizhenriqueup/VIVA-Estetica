import { useState } from 'react';
import InputField from './InputField';
function LoginForm({ onSubmit, pending }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  function handleSubmit(event) {
    event.preventDefault();
    if (pending) return;
    if (!username.trim() || !password.trim()) { setError('Informe usuário e senha.'); return; }
    setError(''); onSubmit({ username: username.trim(), password });
  }
  return <form onSubmit={handleSubmit} aria-busy={pending}>
    <fieldset disabled={pending}>
      <InputField id="username" label="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
      <InputField id="password" label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      {error && <p className="text-danger" role="alert">{error}</p>}
      <button type="submit" className="btn btn-dark w-100">{pending ? 'Entrando…' : 'Entrar'}</button>
    </fieldset>
  </form>;
}
export default LoginForm;
