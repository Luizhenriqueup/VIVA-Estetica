import { useAuth } from '../contexts/auth';
import useResource from '../hooks/useResource';
import { EmptyState, ErrorState, Loading, PageTitle } from '../components/Feedback';
export default function Checklists() {
  const { api } = useAuth();
  const { data, loading, error, reload } = useResource(api.reports);
  return <>
    <PageTitle title="Checklists feitos">Consulte os registros de relatório vinculados à sua conta.</PageTitle>
    <div className="alert alert-info">Os registros disponíveis possuem apenas identificador e vínculo com o usuário. Cliente, data, conclusão, risco e PDF ainda não estão disponíveis.</div>
    {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : !data.length ?
      <EmptyState title="Nenhum registro encontrado">Seus registros aparecerão aqui quando estiverem disponíveis.</EmptyState> :
      <div className="card border-0 shadow-sm"><div className="table-responsive"><table className="table align-middle mb-0">
        <caption className="px-3">Registros disponíveis para sua conta.</caption>
        <thead><tr>{['ID do registro', 'Cliente', 'Data', 'Status', 'Alto risco', 'PDF'].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>{data.map((report) => <tr key={report.id}><th scope="row" className="text-break">{report.id}</th>
          <td>Não informado</td><td>Não informada</td><td>Não informado</td><td>Não informado</td>
          <td><button className="btn btn-sm btn-outline-secondary" disabled aria-label="PDF indisponível">Indisponível</button></td>
        </tr>)}</tbody>
      </table></div></div>}
  </>;
}
