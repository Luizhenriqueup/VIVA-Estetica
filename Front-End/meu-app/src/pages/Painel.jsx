import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { isCompleteQuestionnaire } from '../data/checklist';
import { useAuth } from '../contexts/auth';
import { resolverPerfis } from '../constants/perfis';
import useResource from '../hooks/useResource';
import { ErrorState, Loading, PageTitle } from '../components/Feedback';
import { formatDate } from '../utils/formatDate';
import RecordNewBadge from '../components/Painel/RecordNewBadge';
import '../styles/PainelResumo.css';

function checklistTime(report) {
  const timestamp = typeof report.createdAt === 'string' ? Date.parse(report.createdAt) : NaN;
  return Number.isFinite(timestamp) ? timestamp : null;
}

function ResourceContent({ resource, empty, children }) {
  if (resource.loading) return <Loading />;
  if (resource.error) return <ErrorState error={resource.error} onRetry={resource.reload} />;
  return children.length ? <ul className="list-unstyled mb-0 painel-resumo__lista">{children}</ul> :
    <p className="text-muted py-4 mb-0">{empty}</p>;
}

export default function Painel() {
  const { api, session } = useAuth();
  const user = useResource(api.me);
  const reports = useResource(api.reports);
  const { loading: reportsLoading, reload: reloadReports } = reports;
  const alerts = useResource(api.alerts);
  const profiles = resolverPerfis(user.data?.flags || []);
  const checklists = useMemo(() => (reports.data || []).filter((report) =>
    report && typeof report.id === 'string' && report.userId === session?.userId &&
    isCompleteQuestionnaire(report.questionnaire))
    .sort((a, b) => {
      const first = checklistTime(a);
      const second = checklistTime(b);
      if (first === null) return second === null ? 0 : 1;
      if (second === null) return -1;
      return second - first;
    }).slice(0, 5), [reports.data, session?.userId]);
  const notifications = (alerts.data || []).filter((alert) => alert && typeof alert.id === 'string')
    .slice().sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0)).slice(0, 5);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') {
        if (!reportsLoading) reloadReports();
      }
    };
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [reportsLoading, reloadReports]);

  return <div className="painel-resumo">
    <PageTitle title="Painel">Acompanhe seus checklists e os avisos da equipe.</PageTitle>
    <section className="card border-0 shadow-sm mb-4" aria-labelledby="painel-usuario">
      <div className="card-body p-3 p-md-4">
        <h2 id="painel-usuario" className="h6 text-muted mb-3">Usuário conectado</h2>
        {user.loading ? <Loading /> : user.error ? <ErrorState error={user.error} onRetry={user.reload} /> : <>
          <p className="h5 painel-resumo__nome mb-2">{user.data.username}</p>
          <p className="small text-muted mb-0">
            {user.data.isTemp ? 'Acesso temporário' : <>
              {profiles.length > 1 ? 'Cargos: ' : 'Cargo: '}
              {profiles.length ? profiles.map((profile) => profile.nome).join(' · ') : 'Nenhum cargo atribuído'}
            </>}
          </p>
        </>}
      </div>
    </section>
    <div className="row g-4 align-items-start">
      <div className="col-12 col-xl-6">
        <section className="card border-0 shadow-sm" aria-labelledby="painel-checklists">
          <div className="card-body p-3 p-md-4">
            <h2 id="painel-checklists" className="h5 painel-resumo__titulo mb-3">Meus últimos checklists</h2>
            <ResourceContent resource={reports} empty="Nenhum checklist realizado até o momento.">
              {checklists.map((report) => {
                const createdAt = checklistTime(report);
                return <li key={report.id} className="painel-resumo__item">
                <Link className="painel-resumo__atalho" to={'/checklists/' + encodeURIComponent(report.id)}>
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <h3 className="h6 mb-1 painel-resumo__paciente">{typeof report.nome === 'string' && report.nome.trim() ? report.nome : 'Paciente não informado'}</h3>
                    <RecordNewBadge userId={session?.userId} type="checklist" recordId={report.id} />
                  </div>
                  <p className="small text-muted mb-0">{createdAt !== null ?
                    <time dateTime={report.createdAt}>{formatDate(report.createdAt)}</time> : 'Data de criação não informada'}</p>
                </Link>
              </li>;
              })}
            </ResourceContent>
          </div>
        </section>
      </div>
      <div className="col-12 col-xl-6">
        <section className="card border-0 shadow-sm" aria-labelledby="painel-notificacoes">
          <div className="card-body p-3 p-md-4">
            <h2 id="painel-notificacoes" className="h5 painel-resumo__titulo mb-3">Últimas notificações do sistema</h2>
            <ResourceContent resource={alerts} empty="Nenhuma notificação disponível até o momento.">
              {notifications.map((alert) => <li key={alert.id} className="painel-resumo__item">
                <Link className="painel-resumo__atalho" to={'/alertas/' + encodeURIComponent(alert.id)}>
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <h3 className="h6 mb-1 painel-resumo__paciente">{alert.title}</h3>
                    <RecordNewBadge userId={session?.userId} type="notification" recordId={alert.id} />
                  </div>
                  <p className="small text-muted mb-0">{Number.isFinite(Date.parse(alert.createdAt)) ?
                    <time dateTime={alert.createdAt}>{formatDate(alert.createdAt)}</time> : 'Data não informada'}</p>
                </Link>
              </li>)}
            </ResourceContent>
          </div>
        </section>
      </div>
    </div>
  </div>;
}
