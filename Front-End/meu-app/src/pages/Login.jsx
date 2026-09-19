import LoginForm from "../components/LoginForm";
import '../styles/Login.css'

function Login() {
  function handleLogin(dados) {
    console.log("Dados do login:", dados);
    // aqui entra a chamada da sua API
  }

  return (
    <div className="screen">
      <div className="container d-flex align-items-center justify-content-center min-vh-100">
        <div className="card shadow-sm w-100" style={{ maxWidth: "400px" }}>
          <div className="card-body p-4">
            <h1 className="h4 mb-1 text-center">Viva Estética Segura</h1>
            <p className="text-muted mb-4 text-center">Faça o login para continuar</p>

            <LoginForm onSubmit={handleLogin} />

            <p className="text-center mb-0 mt-4 small">
              Não tem conta? <a href="/cadastro">Criar conta</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
