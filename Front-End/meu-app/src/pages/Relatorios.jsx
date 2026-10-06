import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { ErrorState, PageTitle } from '../components/Feedback';
export default function Relatorios() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState('checklist');
  const [client, setClient] = useState('');
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
  return <>
    <PageTitle title="Relatórios">Selecione o tipo de registro que deseja preencher.</PageTitle>
    <div className="btn-group mb-4" role="group" aria-label="Tipo de relatório">
      <button className={'btn ' + (type === 'checklist' ? 'btn-verde' : 'btn-outline-success')} aria-pressed={type === 'checklist'} onClick={() => setType('checklist')}>Checklist</button>
      <button className={'btn ' + (type === 'alerta' ? 'btn-verde' : 'btn-outline-success')} aria-pressed={type === 'alerta'} onClick={() => setType('alerta')}>Alerta</button>
    </div>
    {type === 'checklist' ? <section className="card border-0 shadow-sm"><div className="card-body p-4">
      <h2 className="h5">Checklist do cliente</h2>
      <p className="text-muted">O preenchimento completo estará disponível quando as perguntas forem cadastradas.</p>
      <label htmlFor="cliente" className="form-label">Nome do cliente</label>
      <input id="cliente" className="form-control mb-3" value={client} onChange={(event) => setClient(event.target.value)} autoComplete="off" aria-describedby="checklist-pendente" />
      <div id="checklist-pendente" className="alert alert-info">Perguntas, respostas, avaliação de risco e geração do PDF ainda não estão disponíveis. O nome digitado não será salvo.</div>
      <button className="btn btn-verde" disabled>Finalizar checklist</button>
      <Link to="/checklists" className="btn btn-link text-success">Ver registros disponíveis</Link>
    </div></section> : <section className="card border-0 shadow-sm"><div className="card-body p-4">
      <h2 className="h5">Novo alerta</h2>
      <p className="text-muted">A publicação é permitida somente a gerentes e administradores. Sua permissão será validada pelo sistema ao enviar.</p>
      {error && <ErrorState error={error} />}
      <form onSubmit={submit} aria-busy={pending}><fieldset disabled={pending}>
        <label htmlFor="titulo" className="form-label">Título do alerta</label>
        <input id="titulo" className="form-control mb-3" value={title} onChange={(event) => setTitle(event.target.value)} required />
        <label htmlFor="descricao" className="form-label">Descrição do alerta</label>
        <textarea id="descricao" className="form-control mb-3" rows="5" value={message} onChange={(event) => setMessage(event.target.value)} required />
        <button className="btn btn-verde" type="submit">{pending ? 'Enviando…' : 'Publicar alerta'}</button>
      </fieldset></form>
    </div></section>}
  </>;
}
