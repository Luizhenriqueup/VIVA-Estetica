import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { ErrorState, PageTitle } from '../components/Feedback';
import { ANSWERS, QUESTIONS, STAGES, isAnswer, isCompleteQuestionnaire } from '../data/checklist';
import '../styles/Checklist.css';

export default function NovoChecklist() {
  const { api } = useAuth();
  const [started, setStarted] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [nameError, setNameError] = useState('');
  const patientInput = useRef(null);
  const [position, setPosition] = useState(0);
  const [answers, setAnswers] = useState(() => Array(QUESTIONS.length).fill(null));
  const [completedStages, setCompletedStages] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const sending = useRef(false);
  const questionHeading = useRef(null);
  const dialog = useRef(null);
  const receiptHeading = useRef(null);
  const question = QUESTIONS[position];
  const stage = STAGES[question.stageIndex];
  const answeredCount = answers.filter(isAnswer).length;
  useEffect(() => {
    if (started && !receipt) questionHeading.current?.focus();
  }, [position, started, receipt]);
  useEffect(() => { if (receipt) dialog.current?.showModal(); }, [receipt]);
  function start(event) {
    event.preventDefault();
    if (!patientName.trim()) {
      setNameError('Informe o nome do paciente antes de iniciar o checklist.');
      patientInput.current?.focus();
      return;
    }
    setPatientName(patientName.trim());
    setNameError('');
    setStarted(true);
  }
  function selectAnswer(value) {
    if (!isAnswer(value) || pending) return;
    setAnswers((current) => current.map((answer, index) => index === position ? value : answer));
    setError(null);
    if (position < QUESTIONS.length - 1) next(value);
  }
  function next(answer = answers[position]) {
    if (!isAnswer(answer) || pending) return;
    if (question.questionIndex === stage.questions.length - 1) {
      //setNotice(`Etapa ${stage.name} concluída com sucesso!`);
      setCompletedStages((current) => [...new Set([...current, question.stageIndex])]);
    } else setNotice('');
    setPosition((current) => Math.min(current + 1, QUESTIONS.length - 1));
  }
  async function submit(event) {
    event.preventDefault();
    if (sending.current || receipt) return;
    if (position < QUESTIONS.length - 1) { next(); return; }
    if (!isCompleteQuestionnaire(answers)) {
      setError(new Error('Responda às 21 perguntas antes de enviar.'));
      setPosition(answers.findIndex((answer) => !isAnswer(answer)));
      return;
    }
    sending.current = true; setPending(true); setError(null);
    try {
      const report = await api.createReport({ nome: patientName, questionnaire: answers });
      setReceipt({ id: report.id, confirmedAt: new Date().toLocaleString('pt-BR') });
    } catch (err) { setError(err); }
    finally { sending.current = false; setPending(false); }
  }
  function reset() {
    setPatientName(''); setNameError('');
    setReceipt(null); setStarted(false); setPosition(0);
    setAnswers(Array(QUESTIONS.length).fill(null)); setCompletedStages([]); setNotice(''); setError(null);
  }
  return <>
    <PageTitle title="Checklist de segurança">Realize o Checklist das seguintes etapas:</PageTitle>
    {started && <p className="text-break"><strong>Paciente:</strong> {patientName}</p>}
    {!started ? <section className="card border-0 shadow-sm"><div className="card-body p-4 p-lg-5">
      <h2 className="h4">Uma pergunta por vez</h2>
      <p>Responda aos 21 itens nas quatro etapas. Você pode voltar para revisar suas respostas antes de enviar.</p>
      <p className="text-muted">Todas as perguntas são obrigatórias. As respostas serão salvas ao concluir o envio.</p>
      <form onSubmit={start} noValidate>
        <label htmlFor="patient-name" className="form-label">Nome do paciente (obrigatório)</label>
        <input ref={patientInput} id="patient-name" name="nome" type="text" className={'form-control mb-3' + (nameError ? ' is-invalid' : '')}
          value={patientName} onChange={(event) => { setPatientName(event.target.value); setNameError(''); }}
          autoComplete="off" required aria-invalid={Boolean(nameError)} aria-describedby={nameError ? 'patient-name-error' : undefined} />
        {nameError && <p id="patient-name-error" className="text-danger" role="alert">{nameError}</p>}
        <div className="d-flex flex-wrap gap-2">
        <button type="submit" className="btn btn-verde">Iniciar Checklist</button>
        <Link className="btn btn-outline-success" to="/checklists">Ver checklists realizados</Link>
        </div>
      </form>
    </div></section> : receipt ? <>
      <section className="card border-0 shadow-sm"><div className="card-body p-4">
        <h2 className="h4" ref={receiptHeading} tabIndex="-1">Checklist enviado</h2>
        <p>Suas 21 respostas foram salvas.</p>
        <p className="text-break">Identificador: {receipt.id}</p>
        <p>Confirmação neste dispositivo: {receipt.confirmedAt}</p>
        <p className="small text-muted">Esta data aparece somente nesta confirmação e não é salva no histórico.</p>
        <div className="d-flex flex-wrap gap-2">
          <Link className="btn btn-verde" to={'/checklists/' + encodeURIComponent(receipt.id)}>Ver respostas</Link>
          <Link className="btn btn-outline-success" to="/checklists">Ver checklists realizados</Link>
          <button type="button" className="btn btn-outline-secondary" onClick={reset}>Novo checklist</button>
        </div>
      </div></section>
      <dialog ref={dialog} className="checklist-dialog" aria-labelledby="checklist-success-title" onClose={() => receiptHeading.current?.focus()}>
        <div className="p-4">
          <i className="bi bi-check-circle text-success fs-1" aria-hidden="true" />
          <h2 id="checklist-success-title" className="h4 mt-3">Checklist realizado com sucesso!</h2>
          <p>Confirmação neste dispositivo: {receipt.confirmedAt}</p>
          <p className="small text-muted">Checklist Salvo</p>
          <div className="d-flex flex-wrap gap-2">
            <button type="button" autoFocus className="btn btn-outline-secondary" onClick={() => dialog.current.close()}>Fechar</button>
            <Link className="btn btn-verde" to="/checklists">Ver checklists realizados</Link>
          </div>
        </div>
      </dialog>
    </> : <>
      <ol className="checklist-stages mb-4" aria-label="Etapas do checklist">
        {STAGES.map((item, index) => <li key={item.name} aria-current={index === question.stageIndex ? 'step' : undefined}
          className={'checklist-stage' + (index === question.stageIndex ? ' checklist-stage--current' : '')}>
          <span className="fw-semibold">{completedStages.includes(index) && <i className="bi bi-check-circle me-2" aria-hidden="true" />}{item.name}</span>
          <span className="small">{index === question.stageIndex ? 'Em andamento' : completedStages.includes(index) ? 'Concluída' : 'A seguir'}</span>
        </li>)}
      </ol>
      <div className="d-flex justify-content-between gap-2 small mb-2"><span>Progresso das respostas</span><span>{answeredCount} de {QUESTIONS.length}</span></div>
      <div className="progress mb-4" role="progressbar" aria-label="Perguntas respondidas" aria-valuenow={answeredCount} aria-valuemin={0} aria-valuemax={QUESTIONS.length}>
        <div className="progress-bar bg-success" style={{ width: `${answeredCount / QUESTIONS.length * 100}%` }} />
      </div>
      <div role="status" aria-live="polite">{notice && <p className="alert alert-success">{notice}</p>}</div>
      <section className="card border-0 shadow-sm"><div className="card-body p-4 p-lg-5">
        <div className="d-flex justify-content-between align-items-baseline flex-wrap gap-2 mb-1">
          <p className="text-success fw-semibold mb-0">{stage.name} — {stage.subtitle}</p>
          {question.critical && <p className="small text-danger mb-0"><i className="bi bi-exclamation-triangle me-1" aria-hidden="true" />Item crítico de segurança</p>}
        </div>
        <p className="small text-muted">Pergunta {question.questionIndex + 1} de {stage.questions.length}</p>
        <h2 className="h4 mb-3 checklist-question" ref={questionHeading} tabIndex="-1">{question.text}</h2>
        {error && <>
          <ErrorState error={error} />
          {(!error.status || error.status >= 500) && <p className="small">Se o envio foi interrompido, <Link to="/checklists" target="_blank" rel="noopener noreferrer">consulte o histórico em outra aba</Link> antes de tentar novamente. O registro pode ter sido salvo.</p>}
        </>}
        <form onSubmit={submit} aria-busy={pending}>
          <fieldset disabled={pending}>
            <legend className="fs-6">Selecione uma resposta (obrigatório)</legend>
            <div className="checklist-options my-3">
              {ANSWERS.map((label, code) => <label key={code} className={'checklist-option' + (answers[position] === code ? ' checklist-option--selected' : '')}>
                <input type="radio" name={'answer-' + position} value={code} checked={answers[position] === code} onChange={() => selectAnswer(code)} required />
                <span>{label}</span>
              </label>)}
            </div>
            <div className="d-flex justify-content-between flex-wrap gap-3 mt-4">
              <button type="button" className="btn btn-outline-success" disabled={position === 0} onClick={() => { setNotice(''); setError(null); setPosition((current) => current - 1); }}>Voltar</button>
              <button type="submit" className="btn btn-verde" disabled={!isAnswer(answers[position])}>
                {pending ? 'Enviando…' : position === QUESTIONS.length - 1 ? 'Enviar Checklist' : 'Próximo'}
              </button>
            </div>
          </fieldset>
        </form>
      </div></section>
    </>}
  </>;
}
