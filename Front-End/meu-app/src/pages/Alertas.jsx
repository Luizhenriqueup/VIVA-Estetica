import { formatDate } from '../utils/formatDate';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import useResource from '../hooks/useResource';
import { useNavigate, useParams } from 'react-router-dom';
import { EmptyState, ErrorState, Loading, PageTitle } from '../components/Feedback';
export default function Alertas() {
  const { api } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useResource(api.alerts);
  return <>
    <PageTitle title="Notificações de eventos adversos">Notificações e orientações para a equipe.</PageTitle>

    
      <Link
        to="/alertas/novo"
        className="btn btn-verde mb-3 me-3 p-3 fs-6"
      >
        <i className="bi bi-bell" />
        {' '}Nova Notificação
      </Link>
   

    {location.state?.created && (
      <div className="alert alert-success" role="status">
        Notificação publicado com sucesso.
      </div>
    )}

    {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : !data.length ?
      <EmptyState title="Nenhum alerta registrado" icon="bi-bell">
        As notificações publicados pela equipe aparecerão aqui.
      </EmptyState> :
      <div className="row g-3">
        {data.map((alert) => 
          <div className="col-12 col-xl-6" key={alert.id}>
            <article className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-start justify-content-between gap-2 mb-4">
                  <h2 className="h5 text-break mb-0">{alert.title}</h2>
                  <span title={alert.resolved ? 'Resolvido' : 'Pendente'}
                    className={'rounded-circle flex-shrink-0 mt-2 ' + (alert.resolved ? 'bg-success' : 'bg-warning')}
                    style={{ width: 8, height: 8 }}>
                    <span className="visually-hidden">{alert.resolved ? 'Resolvido' : 'Pendente'}</span>
                  </span>
                </div>
                
                    <p className="text-break mt-2 align-items-center">
                      <strong>Por:</strong> {alert.createdBy?.username || 'Autor não informado'}
                    </p>

                    <div className='mt-2'>
                      <Link className="btn btn-outline-success" to={'/alertas/' + encodeURIComponent(alert.id)}>
                        Abrir notificação
                      </Link>
                    </div>

                    
                  
                
              </div>
            </article>
          </div>
        )}
      </div>}
  </>;
}
