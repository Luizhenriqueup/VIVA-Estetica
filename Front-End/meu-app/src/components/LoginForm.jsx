import { useState } from "react";
import InputField from "./InputField";
import '../styles/Login.css'

function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    if (onSubmit) {
      onSubmit({ email, senha, lembrar });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <InputField
        id="email"
        label="E-mail"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="voce@exemplo.com"
        autoComplete="email"
      />

      <InputField
        id="senha"
        label="Senha"
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        placeholder="••••••••"
        autoComplete="current-password"
      />

      {/* CONTINUAR CONECTADO
      
      <div className="form-check mb-3">
        <input
          id="lembrar"
          type="checkbox"
          className="form-check-input"
          checked={lembrar}
          onChange={(e) => setLembrar(e.target.checked)}
        />
        <label htmlFor="lembrar" className="form-check-label">
          Continuar conectado
        </label>
      </div>
      */}

      <button type="submit" className="btn btn-dark w-100">
        Entrar
      </button>
    </form>
  );
}

export default LoginForm;
