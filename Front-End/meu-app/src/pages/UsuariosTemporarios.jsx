import { useRef, useState } from 'react';
import { useAuth } from '../contexts/auth';
import { ErrorState, PageTitle } from '../components/Feedback';

export default function UsuariosTemporarios() {
  const { api } = useAuth();
  const [credentials, setCredentials] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const submitting = useRef(false);

  async function submit(event) {
    event.preventDefault();
    if (submitting.current || credentials) return;
    submitting.current = true;
    setPending(true); setError(null);
    try {
      setCredentials(await api.createTemporaryUser());
    } catch (err) {
      setError(err);
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return <>
    <PageTitle title="Usuários Temporários">Gere credenciais de primeiro acesso para a equipe.</PageTitle>
    <section className="card border-0 shadow-sm"><div className="card-body p-4">
      <h2 className="h5">Criar acesso temporário</h2>
      <p>O usuário e a senha serão gerados automaticamente. A criação está disponível para contas Admin e Gerente.</p>
      {error && <>
        <ErrorState error={error} />
        {error.status !== 401 && error.status !== 403 && <p className="small text-muted">Se a resposta foi interrompida, o acesso pode ter sido criado. Confirme com o responsável antes de tentar novamente.</p>}
      </>}
      {!credentials && <form onSubmit={submit} aria-busy={pending}>
        <button className="btn btn-verde" type="submit" disabled={pending}>
          {pending && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
          {pending ? 'Gerando acesso…' : 'Gerar acesso temporário'}
        </button>
      </form>}
      {credentials && <>
        <div className="alert alert-success" role="status">Acesso temporário criado com sucesso.</div>
        <p>Entregue estas credenciais à pessoa que utilizará o acesso. Após entrar, ela poderá selecionar “Ativar conta temporária” para definir seu usuário e sua senha.</p>
        <dl className="row mb-3">
          <dt className="col-12 col-sm-3">Usuário</dt>
          <dd className="col-12 col-sm-9 text-break"><code>{credentials.username}</code></dd>
          <dt className="col-12 col-sm-3">Senha</dt>
          <dd className="col-12 col-sm-9 text-break"><code>{credentials.password}</code></dd>
        </dl>
        <p className="small text-muted">As credenciais deixam de aparecer ao sair ou atualizar esta página. Guarde-as antes de continuar.</p>
        <button type="button" className="btn btn-outline-success" onClick={() => { setCredentials(null); setError(null); }}>Limpar credenciais exibidas</button>
      </>}
    </div></section>
  </>;
}
