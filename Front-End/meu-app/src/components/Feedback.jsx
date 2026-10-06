import { Link } from 'react-router-dom';
export function Loading() {
  return <div className="py-5 text-center text-muted" role="status"><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Carregando…</div>;
}
export function ErrorState({ error, onRetry }) {
  return <div className="alert alert-danger" role="alert"><p className="mb-2">{error.message}</p>
    {error.status === 403 && <p className="small">Sua conta não tem acesso a esta operação. Procure o responsável ou <Link to="/ativar-conta">ative sua conta temporária</Link>, se recebeu credenciais de primeiro acesso.</p>}
    {onRetry && <button className="btn btn-sm btn-outline-danger" onClick={onRetry}>Tentar novamente</button>}
  </div>;
}
export function EmptyState({ title, children, icon = 'bi-inbox' }) {
  return <div className="card border-0 shadow-sm"><div className="card-body text-center py-5">
    <i className={'bi ' + icon + ' display-5 text-success'} aria-hidden="true" />
    <h2 className="h5 mt-3">{title}</h2><div className="text-muted">{children}</div>
  </div></div>;
}
export function PageTitle({ title, children }) {
  return <div className="mb-4"><h1 className="titulo-painel h2">{title}</h1>{children && <p className="text-muted mb-0">{children}</p>}</div>;
}
