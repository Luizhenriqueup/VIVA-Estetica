import { useRef, useState } from 'react';
import { useAuth } from '../../contexts/auth';
import { ErrorState } from '../Feedback';
import ModalUsuarios from './ModalUsuarios';

export default function GerarUsuarioTemporario() {
  const { api } = useAuth();
  const [credentials, setCredentials] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const submitting = useRef(false);

  async function generate() {
    if (submitting.current || credentials) return;
    submitting.current = true;
    setPending(true);
    setError(null);
    try {
      setCredentials(await api.createTemporaryUser());
    } catch (failure) {
      setError(failure);
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  function closeCredentials() {
    setCredentials(null);
  }

  return <>
    <button className="btn btn-verde" type="button" disabled={pending} aria-busy={pending} onClick={generate}>
      {pending ? 'Gerando acesso…' : 'Gerar usuário temporário'}
    </button>
    {error && <div className="mt-3">
      <ErrorState error={error} />
      {error.status !== 401 && error.status !== 403 && (
        <p className="small text-muted">Se a resposta foi interrompida, o acesso pode ter sido criado. Confirme com o responsável antes de tentar novamente.</p>
      )}
    </div>}
    {credentials && (
      <ModalUsuarios title="Acesso temporário criado" onCancel={closeCredentials}>
        <p>Entregue estas credenciais à pessoa que vai usar o acesso. Ela definirá o usuário e a senha definitivos ao ativar a conta.</p>
        <dl className="row mb-3">
          <dt className="col-12 col-sm-3">Usuário</dt>
          <dd className="col-12 col-sm-9 text-break"><code>{credentials.username}</code></dd>
          <dt className="col-12 col-sm-3">Senha</dt>
          <dd className="col-12 col-sm-9 text-break"><code>{credentials.password}</code></dd>
        </dl>
        <p className="small text-muted">Guarde as credenciais antes de fechar. Elas só são exibidas uma vez.</p>
        <div className="d-flex justify-content-end">
          <button type="button" className="btn btn-outline-success" onClick={closeCredentials}>Fechar</button>
        </div>
      </ModalUsuarios>
    )}
  </>;
}
