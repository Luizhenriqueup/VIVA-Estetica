import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { ErrorState } from '../components/Feedback';
import DeleteConfirmation from '../components/DeleteConfirmation';

export default function NovaNotificacao() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [exitWarning, setExitWarning] = useState(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const sending = useRef(false);

  async function submit(event) {
    event.preventDefault();
    if (sending.current) return;
    if (!title.trim() || !message.trim()) { setError(new Error('Preencha o título e a descrição.')); return; }
    sending.current = true; setPending(true); setError(null);
    try {
      await api.createAlert({ title, message });
      navigate('/alertas', { state: { created: true } });
    } catch (err) { setError(err); } finally { sending.current = false; setPending(false); }
  }

  return (<>
    <button
      type="button"
      className="btn btn-outline-success mb-4"
      disabled={pending}
      onClick={() => setExitWarning({})}
    >
      Voltar
    </button>
    <DeleteConfirmation
      record={exitWarning}
      discard
      pending={pending}
      onCancel={() => setExitWarning(null)}
      onConfirm={() => navigate(-1)}
    />
    <section
      id="report-form"
      className="card border-0 shadow-sm report-form"
      aria-live="polite"
      aria-labelledby="report-form-title">
      <div className="card-body p-4 p-lg-5">
        <h2 id="report-form-title" className="h4 mb-5" tabIndex="-1">
          Nova Notificação de evento adverso
        </h2>
        {error && <ErrorState error={error} />}
        <form onSubmit={submit} aria-busy={pending}>
          <fieldset disabled={pending}>
            <label htmlFor="titulo" className="form-label">
              Título da notificação
            </label>
            <input
              id="titulo"
              className="form-control mb-3"
              value={title}
              maxLength={40}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
            <label htmlFor="descricao" className="form-label">
              Descrição da notificação
            </label>
            <textarea
              id="descricao"
              className="form-control mb-3"
              rows="5"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
            />
            <button
              className="btn btn-verde"
              type="submit">
              {pending ? 'Enviando…' : 'Publicar notificação'}
            </button>
          </fieldset>
        </form>
      </div>
    </section>
    </>
  );
}
