import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import useResource from '../hooks/useResource';
import useRecordDeletion from '../hooks/useRecordDeletion';
import DeleteConfirmation from '../components/DeleteConfirmation';
import { EmptyState, ErrorState, Loading, PageTitle } from '../components/Feedback';
import { isCompleteQuestionnaire } from '../data/checklist';
import { useNavigate, useParams } from 'react-router-dom';
export default function Checklists() {
  const { api } = useAuth();
  const { data, loading, error, reload } = useResource(api.reports);
  const navigate = useNavigate();
  const deletion = useRecordDeletion(api.deleteReport, reload);
  const reports = (data || []).filter((report) => report && typeof report.id === 'string' && isCompleteQuestionnaire(report.questionnaire));
  return <>
    <PageTitle title="Checklists feitos">
      Consulte suas respostas salvas.
    </PageTitle>
    <div className="d-flex flex-wrap gap-2 mb-4">
      <Link to="/checklists/novo" className="btn btn-verde">
        Novo checklist
      </Link>
      <button 
        type="button" 
        className="btn btn-outline-success" 
        disabled={loading} 
        onClick={reload}>
        Atualizar checklists
      </button>
    </div>
    {deletion.error && 
      <ErrorState error={deletion.error} />
    }
    {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : !reports.length ?
      <EmptyState title="Nenhum checklist disponível">Seus checklists com as 21 respostas aparecerão aqui após o envio.</EmptyState> :
      <div className="row g-3">
        {reports.map((report) => 
          <div className="col-12 col-xl-6" key={report.id}>
            <article className="card h-100 border-0 shadow-sm">
              <div className="card-body">

                <div className="d-flex justify-content-between align-items-center gap-2 mb-4">
                  <h2 className="h5 mb-0">Checklist do(a) paciente{' '} 
                    {typeof report.nome === 'string' && report.nome.trim() ? report.nome : 'Paciente não informado'}
                  </h2>
                  {/*<p className="text-break mb-0">
                    <strong>Paciente: </strong> 
                    {typeof report.nome === 'string' && report.nome.trim() ? report.nome : 'Paciente não informado'}
                  </p>*/}
                </div>

                <div className="d-flex checklist-card-footer gap-2">
                  <div className='mt-2'>
                    <Link 
                      to={'/checklists/' + encodeURIComponent(report.id)} 
                      className="btn btn-outline-success" 
                      aria-label={'Ver respostas do checklist ' + report.id}>
                      Ver respostas
                    </Link>
                    {deletion.canDelete && 
                      <button 
                        type="button" 
                        className="btn btn-outline-danger ms-2" 
                        disabled={loading || deletion.deleting !== null}
                        aria-label={'Excluir checklist ' + report.id} 
                        onClick={() => deletion.remove(report.id, 'o checklist ' + '' + ' do paciente ' + (report.nome || 'não informado'))}>
                        <i className="bi bi-trash me-1" aria-hidden="true" />{deletion.deleting === report.id ? 'Excluindo…' : 'Excluir'}
                      </button>
                    }
                  </div>

                  <p className="text-break align-items-end m-0">
                    <strong>Por: </strong> 
                    {report.createdBy?.username || 'Autor não informado'}
                  </p>
                </div>


              </div>
            </article>
          </div>)
        }
      </div>}
    <DeleteConfirmation record={deletion.confirmation} pending={deletion.deleting !== null} onCancel={deletion.cancel} onConfirm={deletion.confirm} />
  </>;
}
