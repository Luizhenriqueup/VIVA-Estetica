import { useEffect, useState } from 'react';
import { indicadoresSanitarios } from '../data/checklist';

const rotulos = ['0', '1', '2', '3', '4', '5'];

export default function ChecklistWizard() {
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [concluido, setConcluido] = useState(false);
  const [erro, setErro] = useState('');
  const atual = indicadoresSanitarios[indice];
  const respondidos = Object.keys(respostas).length;

  useEffect(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem('viva-checklist-rascunho') || 'null');
      if (salvo) {
        setRespostas(salvo.respostas || {});
      }
    } catch { /* rascunho inválido: inicia vazio */ }
  }, []);

  function salvarRascunho() {
    localStorage.setItem('viva-checklist-rascunho', JSON.stringify({ respostas }));
    setErro('Rascunho salvo neste navegador. Ele ainda não foi enviado ao servidor.');
  }

  function finalizar() {
    if (respostas[indice] === undefined) {
      setErro('Selecione uma pontuação antes de finalizar.');
      return;
    }
    const faltante = indicadoresSanitarios.findIndex((_, i) => respostas[i] === undefined);
    if (faltante !== -1) {
      setIndice(faltante);
      setErro('Responda todos os indicadores obrigatórios antes de finalizar.');
      return;
    }
    setConcluido(true);
    setErro('');
  }

  if (concluido) {
    const total = Object.values(respostas).reduce((soma, valor) => soma + Number(valor), 0);
    const conformidade = Math.round((total / (indicadoresSanitarios.length * 5)) * 100);
    const classificacao = conformidade >= 85 ? 'Baixo risco' : conformidade >= 70 ? 'Risco moderado' : 'Alto risco';
    return <section className="card border-0 shadow-sm"><div className="card-body p-4 p-lg-5">
      <div className="d-flex align-items-center gap-2 mb-3 text-success"><i className="bi bi-check-circle-fill fs-3" /><h2 className="h4 mb-0">Checklist concluído</h2></div>
      <dl className="row"><dt className="col-sm-4">Itens respondidos</dt><dd className="col-sm-8">{respondidos}/{indicadoresSanitarios.length}</dd>
      <dt className="col-sm-4">Conformidade calculada</dt><dd className="col-sm-8">{conformidade}%</dd>
      <dt className="col-sm-4">Classificação estimada</dt><dd className="col-sm-8">{classificacao}</dd></dl>
      <button type="button" className="btn btn-verde me-2" onClick={() => { setConcluido(false); setIndice(0); }}>Revisar respostas</button>
      <button type="button" className="btn btn-outline-secondary" onClick={() => { localStorage.removeItem('viva-checklist-rascunho'); setRespostas({}); setIndice(0); setConcluido(false); }}>Novo checklist</button>
    </div></section>;
  }

  return <div>
    <section className="card border-0 shadow-sm mb-4"><div className="card-body p-4">
      <div className="d-flex justify-content-end small mt-4 mb-2"><span>Pergunta {indice + 1} de {indicadoresSanitarios.length}</span></div>
      <div className="progress" role="progressbar" aria-label="Progresso do checklist" aria-valuenow={((indice + 1) / indicadoresSanitarios.length) * 100} aria-valuemin="0" aria-valuemax="100"><div className="progress-bar bg-success" style={{ width: `${((indice + 1) / indicadoresSanitarios.length) * 100}%` }} /></div>
    </div></section>

    <section className="card border-0 shadow-sm" aria-labelledby="indicador-titulo">
      <div className="card-header bg-white border-0 pt-4 px-4 d-flex align-items-center justify-content-between">
        {atual.critico && <span className="badge text-bg-danger">Crítico</span>}
      </div>
      <div className="card-body px-4 pb-4">
        <h2 className="h4 mb-3" id="indicador-titulo">{indice + 1}. {atual.titulo}</h2>
        <p className="mb-4">{atual.descricao}</p>
        <fieldset><legend className="form-label fs-6 fw-semibold">Pontuação <span className="text-danger">*</span></legend>
          <div className="row g-2" role="radiogroup" aria-label={`Pontuação para ${atual.titulo}`}>
            {rotulos.map(valor => <div className="col" key={valor}><input className="btn-check" type="radio" name={`pontuacao-${indice}`} id={`pontuacao-${indice}-${valor}`} value={valor} checked={String(respostas[indice]) === valor} onChange={() => { setRespostas(prev => ({ ...prev, [indice]: Number(valor) })); setErro(''); }} />
              <label className="btn btn-outline-success w-100" htmlFor={`pontuacao-${indice}-${valor}`}>{valor}</label></div>)}
          </div>
        </fieldset>
        {erro && <div className="alert alert-info mt-3" role="status">{erro}</div>}
        <div className="d-flex flex-wrap justify-content-between gap-2 mt-4">
          <button type="button" className="btn btn-outline-secondary" onClick={() => { setIndice(i => Math.max(0, i - 1)); setErro(''); }} disabled={indice === 0}><i className="bi bi-arrow-left me-1" />Voltar</button>
          <div className="d-flex flex-wrap gap-2"><button type="button" className="btn btn-outline-success" onClick={salvarRascunho}>Salvar rascunho</button>
            {indice < indicadoresSanitarios.length - 1 ?
              <button type="button" className="btn btn-verde" disabled={respostas[indice] === undefined} onClick={() => { setIndice(i => i + 1); setErro(''); }}>Próximo <i className="bi bi-arrow-right ms-1" /></button> :
              <button type="button" className="btn btn-verde" disabled={respostas[indice] === undefined} onClick={finalizar}>Finalizar</button>}
          </div>
        </div>
      </div>
    </section>
  </div>;
}
