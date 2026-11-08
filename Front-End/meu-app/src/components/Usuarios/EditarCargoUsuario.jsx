import { useRef, useState } from 'react';
import { useAuth } from '../../contexts/auth';
import { LISTA_PERFIS, resolverPerfis } from '../../constants/perfis';
import { ErrorState } from '../Feedback';
import ModalUsuarios from './ModalUsuarios';

export default function EditarCargoUsuario({ user, onCancel, onSaved }) {
  const { api } = useAuth();
  const [role, setRole] = useState(user.flags.length === 1 ? user.flags[0] : '');
  const [review, setReview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const submitting = useRef(false);
  const currentRoles = resolverPerfis(user.flags).map((profile) => profile.nome).join(' · ');
  const nextRole = LISTA_PERFIS.find((profile) => profile.id === role);
  const changed = nextRole && (user.flags.length !== 1 || user.flags[0] !== role);

  async function save() {
    if (submitting.current || !review || !changed) return;
    submitting.current = true;
    setSaving(true);
    setError(null);
    try {
      const result = await api.updateUserFlags(user.userId, [role]);
      if (result?.userId !== user.userId || result.isTemp !== false ||
          typeof result.username !== 'string' || !Array.isArray(result.flags) ||
          result.flags.length !== 1 || result.flags[0] !== role) {
        throw new Error('Não foi possível confirmar a alteração. Atualize a lista antes de tentar novamente.');
      }
      onSaved(result);
    } catch (failure) {
      setError(failure);
      setReview(false);
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  function cancel() {
    if (review) setReview(false);
    else onCancel();
  }

  return <ModalUsuarios title={review ? 'Confirmar alteração de permissões' : 'Editar cargo'} pending={saving} onCancel={cancel}>
    <p className="text-break"><strong>Usuário:</strong> {user.username}</p>
    <p><strong>Cargos atuais:</strong> {currentRoles || 'Nenhum cargo atribuído'}</p>
    {error && <ErrorState error={error} />}
    {review ? (
      <p><strong>Novo cargo:</strong> {nextRole.nome}</p>
    ) : (
      <fieldset>
        <legend className="fs-6">Cargo</legend>
        <p className="small text-muted">A confirmação substituirá os cargos atuais pelo cargo selecionado.</p>
        {LISTA_PERFIS.map((profile) => (
          <label className="form-check mb-2" key={profile.id}>
            <input
              className="form-check-input"
              name="user-role"
              type="radio"
              checked={role === profile.id}
              onChange={() => setRole(profile.id)}
            />
            <span className="form-check-label">{profile.nome}</span>
          </label>
        ))}
      </fieldset>
    )}
    <div className="d-flex justify-content-end flex-wrap gap-2 mt-3">
      <button type="button" className="btn btn-outline-success" disabled={saving} onClick={cancel}>
        {review ? 'Voltar' : 'Cancelar'}
      </button>
      {review ? (
        <button type="button" className="btn btn-verde" disabled={saving} onClick={save}>
          {saving ? 'Salvando…' : 'Confirmar'}
        </button>
      ) : (
        <button type="button" className="btn btn-verde" disabled={!changed} onClick={() => setReview(true)}>
          Revisar alteração
        </button>
      )}
    </div>
  </ModalUsuarios>;
}
