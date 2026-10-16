import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import useResource from '../hooks/useResource';
import { ErrorState, Loading, PageTitle } from '../components/Feedback';
import { ANSWERS, STAGES, isCompleteQuestionnaire } from '../data/checklist';
import '../styles/Checklist.css';
export default function ChecklistDetalhe() {
  const { id } = useParams();
  const { api } = useAuth();
  const loader = useCallback((signal) => api.report(id, signal), [api, id]);
  const { data, loading, error, reload } = useResource(loader);
  return <>
    <Link to="/checklists" className="btn btn-outline-success mb-4">Voltar aos checklists</Link>
    <PageTitle title="Respostas do checklist">Confira as respostas salvas nas quatro etapas.</PageTitle>
    {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : !isCompleteQuestionnaire(data?.questionnaire) ?
      <p className="alert alert-info">Este registro não possui um checklist compatível com o formulário atual.</p> : <>
        <p className="small text-muted text-break">Identificador: {data.id}</p>
        <p className="text-break"><strong>Paciente:</strong> {typeof data.nome === 'string' && data.nome.trim() ? data.nome : 'Paciente não informado'}</p>
        {STAGES.map((stage, stageIndex) => {
          const offset = STAGES.slice(0, stageIndex).reduce((total, item) => total + item.questions.length, 0);
          return <section key={stage.name} className="card border-0 shadow-sm mb-4"><div className="card-body p-4">
            <h2 className="h4">{stage.name} — {stage.subtitle}</h2>
            <ol className="checklist-detail-list mb-0 ps-4">
              {stage.questions.map((question, index) => <li key={question.text}>
                <h3 className="h6">{question.text}</h3>
                <p className="mb-1">Resposta: <strong>{ANSWERS[data.questionnaire[offset + index]]}</strong></p>
                {question.critical && <span className="small text-muted"><i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />Item crítico de segurança</span>}
              </li>)}
            </ol>
          </div></section>;
        })}
      </>}
  </>;
}
