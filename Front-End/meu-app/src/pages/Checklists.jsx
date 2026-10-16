import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import useResource from '../hooks/useResource';
import { EmptyState, ErrorState, Loading, PageTitle } from '../components/Feedback';
import { isCompleteQuestionnaire } from '../data/checklist';
export default function Checklists() {
  const { api } = useAuth();
  const { data, loading, error, reload } = useResource(api.reports);
  const reports = (data || []).filter((report) => report && typeof report.id === 'string' && isCompleteQuestionnaire(report.questionnaire));
  return <>
    <PageTitle title="Checklists feitos">Consulte suas respostas salvas.</PageTitle>
    <div className="d-flex flex-wrap gap-2 mb-4">
      <Link to="/checklists/novo" className="btn btn-verde">Novo checklist</Link>
      <button type="button" className="btn btn-outline-success" disabled={loading} onClick={reload}>Atualizar checklists</button>
    </div>
    {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : !reports.length ?
      <EmptyState title="Nenhum checklist disponível">Seus checklists com as 21 respostas aparecerão aqui após o envio.</EmptyState> :
      <div className="row g-3">{reports.map((report) => <div className="col-12 col-lg-6" key={report.id}>
        <article className="card h-100 border-0 shadow-sm"><div className="card-body p-4">
          <h2 className="h5">Checklist de segurança</h2>
          <p className="text-break"><strong>Paciente:</strong> {typeof report.nome === 'string' && report.nome.trim() ? report.nome : 'Paciente não informado'}</p>
          <p className="text-muted">21 respostas · 4 etapas</p>
          <p className="small text-break">Identificador: {report.id}</p>
          <Link to={'/checklists/' + encodeURIComponent(report.id)} className="btn btn-outline-success" aria-label={'Ver respostas do checklist ' + report.id}>Ver respostas</Link>
        </div></article>
      </div>)}</div>}
  </>;
}
