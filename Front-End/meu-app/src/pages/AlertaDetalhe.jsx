import { formatDate } from '../utils/formatDate';
import useViewedRecord from '../hooks/useViewedRecord';
import useRecordDeletion from '../hooks/useRecordDeletion';
import { useAuth } from '../contexts/auth';
import DeleteConfirmation from '../components/DeleteConfirmation';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState, Loading, PageTitle } from '../components/Feedback';
export default function AlertaDetalhe() {
  const { id } = useParams();
  return <AlertaRecord key={id} id={id} />;
}

function AlertaRecord({ id }) {
  const { api } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useViewedRecord('notification', id);
  const deletion = useRecordDeletion(api.deleteAlert, () => navigate('/alertas', { replace: true }));
  const deleting = deletion.deleting !== null;

  return <>
    <div className="d-flex flex-wrap gap-2 mb-4">
      <button type="button" className="btn btn-outline-success" disabled={deleting} onClick={() => navigate(-1)}>
        Voltar
      </button>
      {!loading && !error && data?.id === id && deletion.canDelete && (
        <button type="button" className="btn btn-outline-danger" disabled={deleting}
          onClick={() => deletion.remove(id, 'a notificação "' + data.title + '"')}>
          <i className="bi bi-trash me-1" aria-hidden="true" />
          {deleting ? 'Excluindo…' : 'Excluir notificação'}
        </button>
      )}
    </div>
    {deletion.error && <ErrorState error={deletion.error} />}
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
    <DeleteConfirmation record={deletion.confirmation} pending={deleting}
      onCancel={deletion.cancel} onConfirm={deletion.confirm} />
  </>;
}
