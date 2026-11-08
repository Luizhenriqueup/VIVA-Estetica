import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import useResource from '../hooks/useResource';
import { EmptyState, ErrorState, Loading, PageTitle } from '../components/Feedback';
import { hasHighRisk, isCompleteQuestionnaire } from '../data/checklist';
import { useNavigate, useParams } from 'react-router-dom';
export default function Checklists() {
  const { api } = useAuth();
  const { data, loading, error, reload } = useResource(api.reports);
  const navigate = useNavigate();
  const reports = (data || []).filter((report) => report && typeof report.id === 'string' && isCompleteQuestionnaire(report.questionnaire));
  return <>
    <PageTitle title="Checklists feitos">
      Consulte suas respostas salvas.
    </PageTitle>
    <div className="d-flex flex-wrap gap-2 mb-4">
      <Link to="/checklists/novo" className="btn btn-verde p-3 fs-6" >
        <i className="bi bi-card-checklist" />
        {' '}Novo checklist
      </Link>
    </div>
    {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : !reports.length ?
      <EmptyState title="Nenhum checklist disponível">Seus checklists com as 21 respostas aparecerão aqui após o envio.</EmptyState> :
      <div className="row g-3">
        {reports.map((report) => 
          <div className="col-12 col-xl-6" key={report.id}>
            <article className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                
                <div className="d-flex justify-content-between gap-2">
                  <h2 className="h5 mb-0">
                    Checklist
                  </h2>

                  {hasHighRisk(report.questionnaire) && (
                    <span className="badge text-bg-danger mt-2">Alto risco</span>
                  )}
                </div>

                  <p className="text-break mt-2">
                    <strong>Paciente: </strong>
                    {typeof report.nome === 'string' && report.nome.trim()
                      ? report.nome
                      : 'Paciente não informado'}
                  </p>

                  <p className="text-break align-items-center mt-2">
                    <strong>Por: </strong> 
                    {report.createdBy?.username || 'Autor não informado'}
                  </p>

                  <div className='mt-2'>
                    <Link 
                      to={'/checklists/' + encodeURIComponent(report.id)} 
                      className="btn btn-outline-success" 
                      aria-label={'Ver respostas do checklist ' + report.id}>
                      Ver respostas
                    </Link>
                  </div>

                


              </div>
            </article>
          </div>)
        }
      </div>}
  </>;
}
