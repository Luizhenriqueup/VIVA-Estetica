import { useState } from 'react';
import { useAuth } from '../contexts/auth';
import { resolverPerfis } from '../constants/perfis';
import { EmptyState, ErrorState, Loading, PageTitle } from '../components/Feedback';
import useUsersAccess from '../components/Usuarios/useUsersAccess';
import GerarUsuarioTemporario from '../components/Usuarios/GerarUsuarioTemporario';
import EditarCargoUsuario from '../components/Usuarios/EditarCargoUsuario';
import useResource from '../hooks/useResource';

const PAGE_SIZE = 20;

export default function UsuariosTemporarios() {
  const access = useUsersAccess();
  if (access.loading) return <Loading />;
  if (access.error) return <ErrorState error={access.error} onRetry={access.reload} />;
  if (!access.allowed) return <div className="alert alert-warning" role="alert">Você não tem permissão para acessar a página Usuários.</div>;
  return <Usuarios admin={access.admin} />;
}

function Usuarios({ admin }) {
  const { api } = useAuth();
  const { data, loading, error, reload } = useResource(api.listUsers);
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [success, setSuccess] = useState('');
  const users = (data || []).filter((user) => user.isTemp === false);
  const totalPages = Math.ceil(users.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(1, totalPages));
  const visible = users.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSaved(user) {
    setSelectedUser(null);
    setSuccess(`Cargo de ${user.username} atualizado com sucesso.`);
    reload();
    window.dispatchEvent(new CustomEvent('viva:users-access', { detail: user }));
  }

  return <>
    <PageTitle title="Usuários">Gere acessos temporários e consulte as contas da equipe.</PageTitle>
    <div className="mb-4"><GerarUsuarioTemporario /></div>
    {success && <p className="alert alert-success" role="status">{success}</p>}
    <section className="card border-0 shadow-sm" aria-labelledby="users-list-title">
      <div className="card-body p-3 p-md-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <h2 id="users-list-title" className="h5 mb-0">Usuários da equipe</h2>
          <button type="button" className="btn btn-outline-success" disabled={loading} onClick={reload}>
            Atualizar lista
          </button>
        </div>
        {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : users.length === 0 ? (
          <EmptyState title="Nenhum usuário ativado" icon="bi-people">
            As contas da equipe aparecem aqui depois da ativação.
          </EmptyState>
        ) : <>
          <div className="table-responsive">
            <table className="table align-middle mb-0" aria-labelledby="users-list-title">
              <thead>
                <tr>
                  <th scope="col"></th>
                  <th scope="col"></th>
                  {admin && <th scope="col" className="text-end"></th>}
                </tr>
              </thead>
              <tbody>
                {visible.map((user) => (
                  <tr key={user.userId}>
                    <th scope="row" className="text-break fw-semibold">{user.username}</th>
                    <td>{resolverPerfis(user.flags).map((profile) => profile.nome).join(' · ') || 'Nenhum cargo atribuído'}</td>
                    {admin && <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success"
                        aria-label={`Editar cargo de ${user.username}`}
                        onClick={() => { setSuccess(''); setSelectedUser(user); }}
                      >
                        Editar
                      </button>
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <nav aria-label="Páginas de usuários" className="d-flex flex-wrap align-items-center gap-2 mt-3">
              <button type="button" className="btn btn-sm btn-outline-success" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Anterior</button>
              <span className="small text-muted" role="status">Página {currentPage} de {totalPages}</span>
              <button type="button" className="btn btn-sm btn-outline-success" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Próxima</button>
            </nav>
          )}
        </>}
      </div>
    </section>
    {admin && selectedUser && (
      <EditarCargoUsuario user={selectedUser} onCancel={() => setSelectedUser(null)} onSaved={handleSaved} />
    )}
  </>;
}
