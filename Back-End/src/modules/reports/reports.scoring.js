const { QUESTIONS, CATEGORIES, ANSWER, getQuestion } = require('./reports.questions');

const PRIORITY = { BAIXO: 'BAIXO', MEDIO: 'MEDIO', ALTO: 'ALTO', CRITICO: 'CRITICO' };

/**
 * REGRA PRINCIPAL (conforme combinado):
 * se qualquer pergunta de SEGURANCA marcada como `critical` vier diferente
 * de ADEQUADO, o relatorio inteiro vira CRITICO, independente do score.
 *
 * O resto e um score percentual simples por peso.
 * TODO: validar faixas (60/85) com a pesquisadora.
 */
function evaluate(answers = {}) {
  let earned = 0;
  let possible = 0;
  const violations = [];

  for (const q of QUESTIONS) {
    const raw = answers[q.id];
    if (raw === undefined || raw === null || raw === '') continue;

    if (q.type === 'ADEQUACAO') {
      if (raw === ANSWER.NAO_SE_APLICA) continue;
      possible += q.weight;
      if (raw === ANSWER.ADEQUADO) {
        earned += q.weight;
      } else {
        violations.push({ questionId: q.id, text: q.text, category: q.category, critical: !!q.critical });
      }
    }
  }

  const score = possible ? Math.round((earned / possible) * 100) : null;

  const hasCriticalSafetyViolation = violations.some(
    (v) => v.critical && v.category === CATEGORIES.SEGURANCA,
  );

  let priority;
  if (hasCriticalSafetyViolation) priority = PRIORITY.CRITICO;
  else if (score === null) priority = PRIORITY.BAIXO;
  else if (score < 60) priority = PRIORITY.ALTO;
  else if (score < 85) priority = PRIORITY.MEDIO;
  else priority = PRIORITY.BAIXO;

  return { score, priority, violations, shouldRaiseAlert: priority === PRIORITY.CRITICO };
}

/** Checa se todas as perguntas obrigatorias foram respondidas. */
function findMissingRequired(answers = {}) {
  return QUESTIONS.filter((q) => q.critical && !answers[q.id]).map((q) => q.id);
}

module.exports = { evaluate, findMissingRequired, PRIORITY, getQuestion };
