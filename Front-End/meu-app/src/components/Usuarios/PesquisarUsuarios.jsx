import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/auth';
import { ErrorState } from '../Feedback';
import { LISTA_PERFIS, resolverPerfis } from '../../constants/perfis';

function validUser(user) {
  return user && typeof user.userId === 'string' && typeof user.username === 'string' && typeof user.isTemp === 'boolean' && Array.isArray(user.flags) && user.flags.every((flag) => typeof flag === 'string');
}
function names(flags) {
  return resolverPerfis(flags).map((profile) => profile.nome).join(' · ') || 'Nenhum cargo atribuído';
}

export default function PesquisarUsuarios({ admin }) {
  const { api } = useAuth();
  const [query, setQuery] = useState('');
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState(false);
  const [draft, setDraft] = useState([]);
  const [pending, setPending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [success, setSuccess] = useState('');
  const request = useRef(null);
  const savingRef = useRef(false);
  const dialog = useRef(null);
  useEffect(() => () => request.current?.abort(), [api]);
  useEffect(() => {
    if (confirmation) dialog.current?.showModal();
    else dialog.current?.close();
  }, [confirmation]);

  async function search(event) {
    event.preventDefault();
    if (savingRef.current) return;
    if (!query.trim()) { setError(new Error('Informe o nome de acesso completo.')); return; }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setPending(true); setError(null); setUser(null); setSelected(false); setNotFound(false); setSuccess(''); setConfirmation(false);
    try {
      const result = await api.searchUser(query, controller.signal);
      if (controller.signal.aborted) return;
      if (!validUser(result)) throw new Error('O servidor retornou dados de usuário inválidos.');
      setUser(result); setDraft([...result.flags]);
    } catch (failure) {
      if (!controller.signal.aborted) {
        if (failure.status === 404) setNotFound(true);
        else setError(failure);
      }
    } finally { if (!controller.signal.aborted) setPending(false); }
  }
  async function save() {
    if (savingRef.current || !confirmation || !admin || !user || user.isTemp) return;
    savingRef.current = true; setSaving(true); setError(null); setSuccess('');
    try {
      const result = await api.updateUserFlags(user.userId, draft);
      if (!validUser(result) || result.userId !== user.userId || result.flags.length !== draft.length || !result.flags.every((flag) => draft.includes(flag))) throw new Error('Não foi possível confirmar a alteração. Pesquise o usuário novamente antes de tentar outra vez.');
      setUser(result); setDraft([...result.flags]); setSuccess('Permissões atualizadas com sucesso.');
      window.dispatchEvent(new CustomEvent('viva:users-access', { detail: result }));
    } catch (failure) { setError(failure); }
    finally { savingRef.current = false; setSaving(false); setConfirmation(false); }
  }
  const changed = user && (draft.length !== user.flags.length || draft.some((flag) => !user.flags.includes(flag)));
  return <section className="card border-0 shadow-sm"><div className="card-body p-4">
    <h2 className="h5">Procurar usuário</h2>
    <p className="small text-muted">Informe o nome de acesso completo, respeitando maiúsculas e minúsculas.</p>
    <form onSubmit={search} className="mb-4">
      <label htmlFor="users-search" className="form-label">Nome de acesso</label>
      <div className="d-flex flex-wrap gap-2">
        <input id="users-search" className="form-control flex-grow-1" style={{ flexBasis: '16rem', minWidth: 0 }} value={query} onChange={(event) => setQuery(event.target.value)} disabled={saving} />
        <button className="btn btn-verde" disabled={pending || saving}>{pending ? 'Pesquisando…' : 'Pesquisar'}</button>
      </div>
    </form>
    {error && <ErrorState error={error} />}
    {success && <p className="alert alert-success" role="status">{success}</p>}
    {notFound && <p className="text-muted" role="status">Nenhum usuário encontrado.</p>}
    {user && <>
      <button type="button" className="list-group-item list-group-item-action border rounded p-3 w-100 text-start mb-3" onClick={() => setSelected(true)} aria-expanded={selected}>
        <span className="fw-semibold d-block text-break">{user.username}</span>
        <span className="small text-muted">{user.isTemp ? 'Acesso temporário' : names(user.flags)}</span>
      </button>
      {selected && <div className="border rounded p-3">
        <h3 className="h6">Informações do usuário</h3>
        <p className="text-break"><strong>Nome de acesso:</strong> {user.username}</p>
        <p><strong>Cargos atuais:</strong> {user.isTemp ? 'Acesso temporário' : names(user.flags)}</p>
        {admin && !user.isTemp && <>
          <fieldset disabled={saving}>
            <legend className="fs-6">Cargo</legend>
            <p className="small text-muted">
              Selecione o cargo que deverá permanecer na conta.
              A confirmação substituirá todas as flags atuais pela selecionada.
            </p>
            {LISTA_PERFIS.map((profile) => (
              <div className="form-check mb-2" key={profile.id}>
                <input
                  id={'user-flag-' + profile.id}
                  name="user-role"
                  type="radio"
                  className="form-check-input"
                  checked={draft.length === 1 && draft[0] === profile.id}
                  onChange={() => setDraft([profile.id])}
                />
                <label
                  className="form-check-label"
                  htmlFor={'user-flag-' + profile.id}
                >
                  {profile.nome}
                </label>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-verde mt-3"
              disabled={!changed || draft.length !== 1}
              onClick={() => setConfirmation(true)}
            >
              Revisar alteração
            </button>
          </fieldset>
        </>}
      </div>}
    </>}
    <dialog ref={dialog} className="border-0 rounded shadow p-4" style={{ maxWidth: 'min(34rem, calc(100vw - 2rem))' }} aria-labelledby="users-confirm-title" onCancel={(event) => { if (saving) event.preventDefault(); else setConfirmation(false); }}>
      <h2 id="users-confirm-title" className="h5">Confirmar alteração de permissões</h2>
      <p className="text-break">Deseja alterar as permissões de <strong>{user?.username}</strong>?</p>
      <p><strong>Atuais:</strong> {names(user?.flags || [])}</p>
      <p><strong>Novas:</strong> {names(draft)}</p>
      <div className="d-flex gap-2 justify-content-end">
        <button type="button" className="btn btn-outline-secondary" disabled={saving} onClick={() => setConfirmation(false)}>Cancelar</button>
        <button type="button" className="btn btn-verde" disabled={saving} onClick={save}>{saving ? 'Salvando…' : 'Confirmar'}</button>
      </div>
    </dialog>
  </div></section>;
}
