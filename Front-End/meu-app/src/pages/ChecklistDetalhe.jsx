import { useRef, useState } from 'react';
import { useAuth } from '../contexts/auth';
import useViewedRecord from '../hooks/useViewedRecord';
import useRecordDeletion from '../hooks/useRecordDeletion';
import DeleteConfirmation from '../components/DeleteConfirmation';
import { ErrorState, Loading, PageTitle } from '../components/Feedback';
import { formatDate } from '../utils/formatDate';
import { ANSWERS, STAGES, isCompleteQuestionnaire, hasHighRisk } from '../data/checklist';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/Checklist.css';
export default function ChecklistDetalhe() {
  const { id } = useParams();
  return <ChecklistRecord key={id} id={id} />;
}

function ChecklistRecord({ id }) {
  const { api } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useViewedRecord('checklist', id);
  const deletion = useRecordDeletion(api.deleteReport, () => navigate('/checklists', { replace: true }));
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const savingLock = useRef(false);
  const hasRecord = !loading && !error && data?.id === id;
  const canEdit = hasRecord && isCompleteQuestionnaire(data.questionnaire);
  const changed = canEdit && draft?.some((answer, index) => answer !== data.questionnaire[index]);
  const deleting = deletion.deleting !== null;

  async function saveAnswers() {
    if (!changed || savingLock.current) return;
    savingLock.current = true;
    setSaving(true);
    setEditError(null);
    try {
      await api.updateReportAnswers(id, draft);
      setDraft(null);
      reload();
    } catch (failure) {
      setEditError(failure);
    } finally {
      savingLock.current = false;
      setSaving(false);
    }
  }

  return <>
    <div className="d-flex flex-wrap gap-2 mb-4">
      <button type="button" className="btn btn-outline-success" disabled={saving || deleting} onClick={() => navigate(-1)}>
        Voltar
      </button>
      {canEdit && (draft ? <>
        <button type="button" className="btn btn-outline-success" disabled={saving} onClick={() => {
          setDraft(null);
          setEditError(null);
        }}>
          Cancelar edição
        </button>
        <button type="button" className="btn btn-verde" disabled={!changed || saving} onClick={saveAnswers}>
          {saving ? 'Salvando…' : 'Salvar respostas'}
        </button>
      </> : (
        <button type="button" className="btn btn-outline-success" disabled={deleting} onClick={() => setDraft([...data.questionnaire])}>
          Editar
        </button>
      ))}
      {hasRecord && deletion.canDelete && !draft && (
        <button type="button" className="btn btn-outline-danger" disabled={deleting}
          onClick={() => deletion.remove(id, 'o checklist do paciente ' + (data.nome || 'não informado'))}>
          {deleting ? 'Excluindo…' : 'Excluir checklist'}
        </button>
      )}
    </div>
    <PageTitle title="Respostas do checklist">Confira as respostas salvas nas quatro etapas.</PageTitle>
    {editError && <ErrorState error={editError} />}
    {deletion.error && <ErrorState error={deletion.error} />}
    {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : !isCompleteQuestionnaire(data?.questionnaire) ?
      <p className="alert alert-info">Este registro não possui um checklist compatível com o formulário atual.</p> : <>
          <div className="d-flex flex-wrap gap-2 mb-4">
            <p className="small text-muted text-break">
              {formatDate(data.createdAt)}
            </p>
            {hasRecord && hasHighRisk(data.questionnaire) && (
              <span className="badge text-bg-danger ms-auto align-self-start">Alto risco</span>
            )}
          </div>
        <p className="text-break">
          <strong>Paciente: </strong> 
          {typeof data.nome === 'string' && data.nome.trim() ? data.nome : 'Paciente não informado'}
        </p>
        <p className="text-break">
          <strong>Criado por: </strong> 
          {data.createdBy?.username || 'Autor não informado'}
        </p>
        {STAGES.map((stage, stageIndex) => {
          const offset = STAGES.slice(0, stageIndex).reduce((total, item) => total + item.questions.length, 0);
          return <section key={stage.name} className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h2 className="h4">
                {stage.name} — {stage.subtitle}
              </h2>
              <ol className="checklist-detail-list mb-0 ps-4">
                {stage.questions.map((question, index) => 
                  <li key={question.text}>
                    <h3 className="h6">
                      {question.text}
                    </h3>
                    {draft ? (
                      <label className="d-block mb-1">
                        Resposta:
                        <select className="form-select mt-1" aria-label={question.text}
                          value={draft[offset + index]} disabled={saving}
                          onChange={(event) => {
                            const answer = Number(event.target.value);
                            setDraft((current) => current.map((value, position) =>
                              position === offset + index ? answer : value));
                          }}>
                          {ANSWERS.map((label, value) => <option key={label} value={value}>{label}</option>)}
                        </select>
                      </label>
                    ) : <p className="mb-1">
                      Resposta:{' '} 
                      <strong>
                        {ANSWERS[data.questionnaire[offset + index]]}
                      </strong>
                    </p>}
                    {question.critical && 
                      <span className="small text-muted">
                        <i className="bi bi-exclamation-triangle me-2" 
                        aria-hidden="true" 
                        />
                        Item crítico de segurança
                      </span>
                    }
                  </li>
                )}
              </ol>
            </div>
          </section>;
        })}
      </>}
    <DeleteConfirmation record={deletion.confirmation} pending={deleting}
      onCancel={deletion.cancel} onConfirm={deletion.confirm} />
  </>;
}
