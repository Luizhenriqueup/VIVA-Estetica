import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { ErrorState, PageTitle } from '../components/Feedback';
export default function Relatorios() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState(null);
  const [client, setClient] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const sending = useRef(false);
  function chooseType(selected) {
    setType(selected);
    setError(null);
    window.requestAnimationFrame(() => {
      const title = document.getElementById('report-form-title');
      if (!title) return;
      title.focus();
      title.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  }
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
    <PageTitle title="Relatórios">Escolha o que você precisa fazer.</PageTitle>
    <div className="row g-4 mb-4">
      <div className="col-12 col-md-6">
        <button type="button" className={'report-choice card border-0 shadow-sm text-start w-100 h-100' + (type === 'checklist' ? ' report-choice--active' : '')}
          aria-pressed={type === 'checklist'} onClick={() => chooseType('checklist')}>
          <span className="card-body d-flex flex-column align-items-start p-4 p-lg-5">
            <span className="report-choice__icon mb-3" aria-hidden="true"><i className="bi bi-card-checklist" /></span>
            <span className="h4 report-choice__title mb-2">Fazer Checklist</span>
            <span className="text-muted">Preencha um checklist do cliente e registre as informações da avaliação.</span>
            <span className="btn btn-verde mt-4">Acessar checklist</span>
          </span>
        </button>
      </div>
      <div className="col-12 col-md-6">
        <button type="button" className={'report-choice card border-0 shadow-sm text-start w-100 h-100' + (type === 'alerta' ? ' report-choice--active' : '')}
          aria-pressed={type === 'alerta'} onClick={() => chooseType('alerta')}>
          <span className="card-body d-flex flex-column align-items-start p-4 p-lg-5">
            <span className="report-choice__icon report-choice__icon--alert mb-3" aria-hidden="true"><i className="bi bi-bell" /></span>
            <span className="h4 report-choice__title mb-2">Criar Alerta</span>
            <span className="text-muted">Registre um aviso ou situação que precisa ser comunicada aos responsáveis.</span>
            <span className="btn btn-outline-success mt-4">Acessar alertas</span>
          </span>
        </button>
      </div>
    </div>
    {type && <section id="report-form" className="card border-0 shadow-sm report-form" aria-live="polite" aria-labelledby="report-form-title"><div className="card-body p-4 p-lg-5">
    {type === 'checklist' ? <>
      <h2 id="report-form-title" className="h4" tabIndex="-1">Checklist do cliente</h2>
      <p className="text-muted">O preenchimento completo estará disponível quando as perguntas forem cadastradas.</p>
      <label htmlFor="cliente" className="form-label">Nome do cliente</label>
      <input id="cliente" className="form-control mb-3" value={client} onChange={(event) => setClient(event.target.value)} autoComplete="off" aria-describedby="checklist-pendente" />
      <div id="checklist-pendente" className="alert alert-info">Perguntas, respostas, avaliação de risco e geração do PDF ainda não estão disponíveis. O nome digitado não será salvo.</div>
      <button className="btn btn-verde" disabled>Finalizar checklist</button>
      <Link to="/checklists" className="btn btn-link text-success">Ver registros disponíveis</Link>
    </> : <>
      <h2 id="report-form-title" className="h4 mb-5" tabIndex="-1">Novo alerta</h2>
      {error && <ErrorState error={error} />}
      <form onSubmit={submit} aria-busy={pending}><fieldset disabled={pending}>
        <label htmlFor="titulo" className="form-label">Título do alerta</label>
        <input id="titulo" className="form-control mb-3" value={title} onChange={(event) => setTitle(event.target.value)} required />
        <label htmlFor="descricao" className="form-label">Descrição do alerta</label>
        <textarea id="descricao" className="form-control mb-3" rows="5" value={message} onChange={(event) => setMessage(event.target.value)} required />
        <button className="btn btn-verde" type="submit">{pending ? 'Enviando…' : 'Publicar alerta'}</button>
      </fieldset></form>
    </>}
    </div></section>}
  </>;
}
