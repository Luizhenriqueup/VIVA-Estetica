import { formatDate } from '../utils/formatDate';
import useViewedRecord from '../hooks/useViewedRecord';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState, Loading, PageTitle } from '../components/Feedback';
export default function AlertaDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useViewedRecord('notification', id);
  return <>
    <button
      type="button"
      className="btn btn-outline-success mb-4"
      onClick={() => navigate(-1)}
    >
      Voltar
    </button>
    {loading ? <Loading /> : error ? 
    <ErrorState error={error} onRetry={reload} /> :
    <article className="card border-0 shadow-sm">
      <div className="card-body p-4">

        <PageTitle title={data.title}>
          {formatDate(data.createdAt)}
        </PageTitle>

        <p className="text-break">
          <strong>Criado por:</strong> {data.createdBy?.username || 'Autor não informado'}
        </p>

        <p className="preserve-lines">
          {data.message || 'Sem descrição.'}
        </p>
        
      </div>
    </article>}
  </>;
}
