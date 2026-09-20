import LoginForm from "../components/Login/LoginForm";
import '../styles/Login.css'
import logoViva from '../assets/viva-estetica.png'
import { Link } from "react-router-dom";

function Login() {
  function handleLogin(dados) {
    console.log("Dados do login:", dados);
    // aqui entra a chamada da sua API
  }

  return (
    <div className="screen">
      <div className="container d-flex align-items-center justify-content-center min-vh-100">
        <div className="card shadow-sm w-100 bg-light" style={{ maxWidth: "400px" }}>
          <div className="text-center mt-4">
          <img src={logoViva} className="img-fluid tamanhoImagem" alt="Vite logo" />
          </div>
          <div className="card-body p-4">
            <h1 className="h4 mb-1 text-center mt-1">Bem Vindo(a)</h1>
            <p className="text-muted text-center">Faça o login para continuar</p>

            <LoginForm onSubmit={handleLogin} />

            <p className="text-center mb-0 mt-4 small">
              Não tem conta? <a href="/cadastro">Criar conta</a>
            </p>

            <div className="text-center">
              <Link to="/painel" className="btn btn-dark mt-3">
                Navegador temporario
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
