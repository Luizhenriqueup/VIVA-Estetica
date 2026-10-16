import { isCompleteQuestionnaire } from '../data/checklist';
import { useAuth } from '../contexts/auth';
import useResource from '../hooks/useResource';
import { ErrorState, Loading, PageTitle } from '../components/Feedback';
function Metric({ title, resource, unavailable, description }) {
  return <div className="col-12 col-sm-6 col-xl-3"><section className="card h-100 shadow-sm border-0"><div className="card-body">
    <h2 className="h6 text-muted">{title}</h2>
    {resource?.loading ? <Loading /> : resource?.error ? <ErrorState error={resource.error} onRetry={resource.reload} /> :
      <p className="display-6 fw-semibold text-success">{unavailable ? '—' : resource.data.length}</p>}
    <p className="small text-muted mb-0">{description}</p>
  </div></section></div>;
}
export default function Painel() {
  const { api } = useAuth();
  const reports = useResource(api.reports);
  const alerts = useResource(api.alerts);
  return <>
    <PageTitle title="Painel">Acompanhe seus registros e os avisos da equipe.</PageTitle>
    <div className="row g-3 mb-4">
      <Metric title="Meus registros de relatório" resource={reports} description="Registros vinculados à sua conta. Não indicam checklists concluídos." />
      <Metric title="Checklists realizados" resource={{ ...reports, data: (reports.data || []).filter((report) => isCompleteQuestionnaire(report?.questionnaire)) }} description="Registros com as 21 respostas do checklist." />
      <Metric title="Checklists de alto risco" unavailable description="Classificação de risco ainda não disponível." />
      <Metric title="Alertas registrados" resource={alerts} description="Avisos da equipe. Indicador de leitura ainda não disponível." />
    </div>
    {/*}
    <div className="row g-3">
      {[['relatorios', 'Relatórios', 'bi-bar-chart-fill'], ['pops', 'POPs', 'bi-journal-text'], ['conteudo', 'Conteúdo educativo', 'bi-mortarboard-fill']].map(([id, label, icon]) =>
        <div className="col-12 col-lg-4" key={id}><Link to={'/' + id} className="card-acao w-100 h-100 text-decoration-none">
          <i className={'bi ' + icon + ' card-acao__icone'} aria-hidden="true" /><span className="card-acao__texto">{label}</span>
        </Link></div>)}
    </div>
    {*/}
  </>;
}
