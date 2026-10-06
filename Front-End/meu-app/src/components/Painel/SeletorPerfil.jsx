import { resolverPerfis } from '../../constants/perfis';
// Flags são cumulativas. O login atual não as retorna; não existe troca de perfil.
export default function SeletorPerfil({ perfisPermitidos }) {
  const perfis = resolverPerfis(perfisPermitidos);
  return <div className="px-2 py-2 small"><span className="d-block opacity-75">Perfil</span>
    <span>{perfis.length ? perfis.map((perfil) => perfil.nome).join(', ') : 'Não informado pelo sistema'}</span>
  </div>;
}
