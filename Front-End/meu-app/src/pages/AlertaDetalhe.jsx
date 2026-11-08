import { useRef, useState } from 'react';
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
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const statusLock = useRef(false);
  const hasAlert = !loading && !error && data?.id === id;
  const resolved = data?.resolved === true;

  async function changeStatus() {
    if (!hasAlert || !deletion.canDelete || deleting || statusLock.current) return;
    statusLock.current = true;
    setSavingStatus(true);
    setStatusError(null);
    try {
      await api.updateAlertStatus(id, !resolved);
      reload();
    } catch (failure) {
      setStatusError(failure);
    } finally {
      statusLock.current = false;
      setSavingStatus(false);
    }
  }

  return <>
    <div className="d-flex flex-wrap gap-2 mb-4">
      <button type="button" className="btn btn-outline-success" disabled={deleting || savingStatus} onClick={() => navigate(-1)}>
        Voltar
      </button>
      {hasAlert && deletion.canDelete && (
        <button type="button" className="btn btn-outline-danger" disabled={deleting || savingStatus}
          onClick={() => deletion.remove(id, 'a notificação "' + data.title + '"')}>
          {deleting ? 'Excluindo…' : 'Excluir notificação'}
        </button>
      )}
      {deletion.canDelete && (
            <button type="button" className="btn btn-sm btn-outline-primary" disabled={savingStatus || deleting}
              onClick={changeStatus}>
              {savingStatus ? 'Salvando…' : resolved ? 'Mudar Status' : 'Mudar Status'}
            </button>
          )}
    </div>
    {deletion.error && <ErrorState error={deletion.error} />}
    {statusError && <ErrorState error={statusError} />}
    {loading ? <Loading /> : error ? 
    <ErrorState error={error} onRetry={reload} /> :
    <article className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <span className={'badge ' + (resolved ? 'text-bg-success' : 'text-bg-warning')}>
            {resolved ? 'Resolvido' : 'Pendente'}
          </span>
          
        </div>

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
