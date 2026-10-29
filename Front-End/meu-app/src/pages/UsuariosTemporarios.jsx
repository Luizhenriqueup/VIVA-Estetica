import { useState } from 'react';
import { ErrorState, Loading, PageTitle } from '../components/Feedback';
import useUsersAccess from '../components/Usuarios/useUsersAccess';
import GerarUsuarioTemporario from '../components/Usuarios/GerarUsuarioTemporario';
import PesquisarUsuarios from '../components/Usuarios/PesquisarUsuarios';

export default function UsuariosTemporarios() {
  const access = useUsersAccess();
  const [section, setSection] = useState('generate');
  if (access.loading) return <Loading />;
  if (access.error) return <ErrorState error={access.error} onRetry={access.reload} />;
  if (!access.allowed) return <div className="alert alert-warning" role="alert">Você não tem permissão para acessar a página Usuários.</div>;
  return <>
    <PageTitle title="Usuários">Gere acessos temporários e consulte as contas da equipe.</PageTitle>
    <div className="d-flex flex-wrap gap-2 mb-4" role="group" aria-label="Funcionalidades de usuários">
      <button type="button" className={'btn ' + (section === 'generate' ? 'btn-verde' : 'btn-outline-success')} aria-pressed={section === 'generate'} onClick={() => setSection('generate')}>Gerar usuário temporário</button>
      <button type="button" className={'btn ' + (section === 'search' ? 'btn-verde' : 'btn-outline-success')} aria-pressed={section === 'search'} onClick={() => setSection('search')}>Procurar usuário</button>
    </div>
    <div hidden={section !== 'generate'}><GerarUsuarioTemporario /></div>
    <div hidden={section !== 'search'}><PesquisarUsuarios admin={access.admin} /></div>
  </>;
}
