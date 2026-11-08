import { formatDate } from '../utils/formatDate';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import useResource from '../hooks/useResource';
import useRecordDeletion from '../hooks/useRecordDeletion';
import DeleteConfirmation from '../components/DeleteConfirmation';
import { useNavigate, useParams } from 'react-router-dom';
import { EmptyState, ErrorState, Loading, PageTitle } from '../components/Feedback';
export default function Alertas() {
  const { api } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useResource(api.alerts);
  const deletion = useRecordDeletion(api.deleteAlert, reload);
  return <>
    <PageTitle title="Notificações de eventos adversos">Notificações e orientações para a equipe.</PageTitle>

    
      <Link
        to="/alertas/novo"
        className="btn btn-verde mb-3 me-3"
      >
        Nova Notificação
      </Link>
   

    {location.state?.created && (
      <div className="alert alert-success" role="status">
        Notificação publicado com sucesso.
      </div>
    )}

    {deletion.error && <ErrorState error={deletion.error} />}

    {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : !data.length ?
      <EmptyState title="Nenhum alerta registrado" icon="bi-bell">
        As notificações publicados pela equipe aparecerão aqui.
      </EmptyState> :
      <div className="row g-3">
        {data.map((alert) => 
          <div className="col-12 col-xl-6" key={alert.id}>
            <article className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h2 className="h5 text-break mb-4">
                  {alert.title}
                </h2>
                
                    <p className="text-break mt-2 align-items-center">
                      <strong>Por:</strong> {alert.createdBy?.username || 'Autor não informado'}
                    </p>

                    <div className='mt-2'>
                      <Link className="btn btn-outline-success" to={'/alertas/' + encodeURIComponent(alert.id)}>
                        Abrir notificação
                      </Link>
                      
                      {deletion.canDelete && 
                        <button 
                          type="button" 
                          className="btn btn-outline-danger ms-2" 
                          disabled={loading || deletion.deleting !== null}
                          aria-label={'Excluir notificação ' + alert.id} 
                          onClick={() => deletion.remove(alert.id, 'a notificação "' + alert.title + '"')}>
                          <i className="bi bi-trash me-1" aria-hidden="true" />{deletion.deleting === alert.id ? 'Excluindo…' : 'Excluir'}
                        </button>
                      }
                    </div>

                    
                  
                
              </div>
            </article>
          </div>
        )}
      </div>}
    <DeleteConfirmation record={deletion.confirmation} pending={deletion.deleting !== null} onCancel={deletion.cancel} onConfirm={deletion.confirm} />
  </>;
}