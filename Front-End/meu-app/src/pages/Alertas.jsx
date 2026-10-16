import { formatDate } from '../utils/formatDate';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import useResource from '../hooks/useResource';
import { EmptyState, ErrorState, Loading, PageTitle } from '../components/Feedback';
export default function Alertas() {
  const { api } = useAuth();
  const location = useLocation();
  const { data, loading, error, reload } = useResource(api.alerts);
  return <>
    <PageTitle title="Alertas">Notificações e orientações para a equipe.</PageTitle>
    {location.state?.created && <div className="alert alert-success" role="status">Notificação publicado com sucesso.</div>}
    <p className="small text-muted">O status de leitura das Notificações ainda não está disponível.</p>
    <button className="btn btn-outline-success mb-3" disabled={loading} onClick={reload}>Atualizar notificações</button>
    {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : !data.length ?
      <EmptyState title="Nenhum alerta registrado" icon="bi-bell">As notificações publicados pela equipe aparecerão aqui.</EmptyState> :
      <div className="row g-3">{data.map((alert) => <div className="col-12 col-lg-6" key={alert.id}><article className="card h-100 border-0 shadow-sm">
        <div className="card-body"><p className="small text-muted">{formatDate(alert.createdAt)}</p>
          <h2 className="h5 text-break">{alert.title}</h2><p className="alert-excerpt">{alert.message || 'Sem descrição.'}</p>
          <Link className="btn btn-outline-success" to={'/alertas/' + encodeURIComponent(alert.id)}>Abrir notificação</Link>
        </div>
      </article></div>)}</div>}
  </>;
}
