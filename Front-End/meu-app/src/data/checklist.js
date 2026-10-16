// Contrato posicional fixo: não reordenar perguntas ou alternativas.
// Os códigos representam alternativas, não uma pontuação de risco.
export const ANSWERS = ['Adequado', 'Parcial', 'Inadequado'];
export const STAGES = [
  { name: 'PRÉ', subtitle: 'Visualizar o Risco', questions: [
    { text: 'Paciente identificado corretamente', critical: true },
    { text: 'Ficha de anamnese completa', critical: true },
    { text: 'Termo de consentimento assinado' },
    { text: 'Sala higienizada' },
    { text: 'Equipamentos de Proteção Individual (EPIs) disponíveis' },
    { text: 'Equipamentos calibrados' },
    { text: 'Procedimento confirmado verbalmente' },
    { text: 'Kit de atendimento de emergência revisado', critical: true },
  ] },
  { name: 'DURANTE', subtitle: 'Intervir com Técnica', questions: [
    { text: 'Produto conferido (nome, lote, validade)', critical: true },
    { text: 'Materiais com esterilidade assegurada para uso seguro', critical: true },
    { text: 'Higienização das mãos realizada' },
    { text: 'Uso correto de Equipamentos de Proteção Individual (EPIs)' },
    { text: 'Monitoramento de complicações e dor', critical: true },
    { text: 'Ambiente limpo e seguro' },
  ] },
  { name: 'PÓS', subtitle: 'Validar o Processo', questions: [
    { text: 'Ausência de complicações imediatas' },
    { text: 'Registro fotográfico realizado' },
    { text: 'Anotações no prontuário atualizadas' },
    { text: 'Orientações pós-procedimento entregues' },
    { text: 'Higienização final do ambiente e descarte correto dos resíduos' },
  ] },
  { name: 'APRENDER', subtitle: 'Reflexão e Melhoria', questions: [
    { text: 'Registro de evento adverso/quase erro (se aplicável)' },
    { text: 'Comunicação efetiva entre equipe' },
  ] },
];
export const QUESTIONS = STAGES.flatMap((stage, stageIndex) =>
  stage.questions.map((question, questionIndex) => ({ ...question, stageIndex, questionIndex })));
export function isAnswer(value) {
  return Number.isInteger(value) && value >= 0 && value < ANSWERS.length;
}
export function isCompleteQuestionnaire(value) {
  return Array.isArray(value) && value.length === QUESTIONS.length && Array.from(value).every(isAnswer);
}
