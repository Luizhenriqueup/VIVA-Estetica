import { formatDate } from '../utils/formatDate';
import { Link, useParams } from 'react-router-dom';
import useViewedRecord from '../hooks/useViewedRecord';
import { ErrorState, Loading, PageTitle } from '../components/Feedback';
export default function AlertaDetalhe() {
  const { id } = useParams();
  const { data, loading, error, reload } = useViewedRecord('notification', id);
  return <>
    <Link to="/alertas" className="btn btn-outline-success mb-4">Voltar</Link>
    {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> :
      <article className="card border-0 shadow-sm"><div className="card-body p-4">
        <PageTitle title={data.title}>{formatDate(data.createdAt)}</PageTitle>
        <p className="preserve-lines">{data.message || 'Sem descrição.'}</p>
      </div></article>}
  </>;
}
