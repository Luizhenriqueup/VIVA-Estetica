/**
 * CATALOGO DE PERGUNTAS DO RELATORIO.
 *
 * Campos:
 *  - id: usado como chave nas respostas enviadas pelo front
 *  - category: 'SEGURANCA' pesa na criticidade; as outras sao informativas
 *  - type: 'ADEQUACAO' (ADEQUADO | INADEQUADO | NAO_SE_APLICA) | 'TEXTO' | 'ESCOLHA'
 *  - critical: se true e a resposta nao for ADEQUADO -> relatorio vira CRITICO
 *  - weight: peso no score geral
 *
 * TODO: substituir pelo conteudo real do Metodo VIVA (4 etapas) com a pesquisadora.
 */
const CATEGORIES = {
  SEGURANCA: 'SEGURANCA',
  ESTRUTURA: 'ESTRUTURA',
  PROFISSIONAL: 'PROFISSIONAL',
  POS_PROCEDIMENTO: 'POS_PROCEDIMENTO',
};

const ANSWER = { ADEQUADO: 'ADEQUADO', INADEQUADO: 'INADEQUADO', NAO_SE_APLICA: 'NAO_SE_APLICA' };

const QUESTIONS = [
  {
    id: 'seg_01',
    category: CATEGORIES.SEGURANCA,
    type: 'ADEQUACAO',
    critical: true,
    weight: 3,
    text: 'O profissional possui registro no conselho de classe e habilitacao para o procedimento?',
  },
  {
    id: 'seg_02',
    category: CATEGORIES.SEGURANCA,
    type: 'ADEQUACAO',
    critical: true,
    weight: 3,
    text: 'Os materiais utilizados sao descartaveis/esterilizados e o lote/validade foi conferido?',
  },
  {
    id: 'est_01',
    category: CATEGORIES.ESTRUTURA,
    type: 'ADEQUACAO',
    critical: false,
    weight: 2,
    text: 'O ambiente possui estrutura adequada (lavatorio, superficie limpa, descarte de perfurocortante)?',
  },
  {
    id: 'pos_01',
    category: CATEGORIES.POS_PROCEDIMENTO,
    type: 'TEXTO',
    critical: false,
    weight: 1,
    text: 'Quais orientacoes de pos-procedimento foram entregues ao cliente?',
  },
];

const getQuestions = () => QUESTIONS;
const getQuestion = (id) => QUESTIONS.find((q) => q.id === id) || null;

module.exports = { QUESTIONS, CATEGORIES, ANSWER, getQuestions, getQuestion };
