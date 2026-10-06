import { formatDate } from '../utils/formatDate';
import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import useResource from '../hooks/useResource';
import { ErrorState, Loading, PageTitle } from '../components/Feedback';
export default function AlertaDetalhe() {
  const { id } = useParams();
  const { api } = useAuth();
  const loader = useCallback((signal) => api.alert(id, signal), [api, id]);
  const { data, loading, error, reload } = useResource(loader);
  return <>
    <Link to="/alertas" className="btn btn-outline-success mb-4">Voltar aos alertas</Link>
    {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> :
      <article className="card border-0 shadow-sm"><div className="card-body p-4">
        <PageTitle title={data.title}>{formatDate(data.createdAt)}</PageTitle>
        <p className="preserve-lines">{data.message || 'Sem descrição.'}</p>
        <p className="small text-muted mb-0">A abertura deste alerta não registra confirmação de leitura.</p>
      </div></article>}
  </>;
}
