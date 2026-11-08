import { Link } from 'react-router-dom';
import { PageTitle } from '../components/Feedback';

const etapas = [
  {
    id: 'visualizar',
    atalho: 'Visualizar',
    titulo: 'Visualizar o Risco',
    momento: 'Antes do atendimento',
    icone: 'bi-eye',
    orientacoes: [
      'Confira a identificação do paciente, a ficha de anamnese e o termo de consentimento.',
      'Revise as condições da sala, dos equipamentos e dos itens de biossegurança.',
    ],
  },
  {
    id: 'intervir',
    atalho: 'Intervir',
    titulo: 'Intervir com Técnica',
    momento: 'Durante o atendimento',
    icone: 'bi-activity',
    orientacoes: [
      'Use o checklist para conferir produtos, materiais e equipamentos de proteção durante o atendimento.',
      'Siga os POPs da equipe e registre as condições observadas no procedimento.',
    ],
  },
  {
    id: 'validar',
    atalho: 'Validar',
    titulo: 'Validar o Processo',
    momento: 'Após o atendimento',
    icone: 'bi-check2-square',
    orientacoes: [
      'Revise os itens críticos e confirme se os registros do atendimento foram concluídos.',
      'Confira se as orientações pós-procedimento foram repassadas ao paciente.',
    ],
  },
  {
    id: 'aprender',
    atalho: 'Aprender',
    titulo: 'Reflexão e Melhoria',
    momento: 'Aprendizado da equipe',
    icone: 'bi-book',
    orientacoes: [
      'Registre eventos adversos ou quase erros e compartilhe o que aconteceu com a equipe.',
      'Use esses registros para discutir melhorias e reduzir a chance de repetição.',
    ],
  },
];

export default function Ajuda() {
  return <>
    <PageTitle title="Ajuda">Entenda cada etapa do checklist e saiba quando usar as notificações.</PageTitle>

    <section className="mb-4" aria-labelledby="ajuda-etapas">
      <h2 id="ajuda-etapas" className="h5 mb-3">Etapas do checklist</h2>

      <div className="row row-cols-1 row-cols-lg-2 g-3">
        {etapas.map((etapa) => (
          <div key={etapa.id} className="col">
            <article className="card h-100 border-0 shadow-sm" aria-labelledby={'ajuda-' + etapa.id}>
              <div className="card-body p-3 p-md-4">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <span className="rounded bg-success-subtle text-success-emphasis p-2 fs-5 lh-1" aria-hidden="true">
                    <i className={'bi ' + etapa.icone} />
                  </span>
                  <div>
                    <p className="small text-muted mb-1">{etapa.momento}</p>
                    <h3 id={'ajuda-' + etapa.id} tabIndex={-1} className="h5 mb-0">{etapa.titulo}</h3>
                  </div>
                </div>
                <ul className="ps-4 mb-0">
                  {etapa.orientacoes.map((orientacao) => <li key={orientacao}>{orientacao}</li>)}
                </ul>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>

    <section className="card border-0 shadow-sm" aria-labelledby="ajuda-notificacoes">
      <div className="card-body p-3 p-md-4">
        <h2 id="ajuda-notificacoes" className="h5 mb-3">
          <i className="bi bi-bell text-success me-2" aria-hidden="true" />
          Para que servem as notificações?
        </h2>
        <p>Use as notificações para comunicar à equipe um evento adverso ou um quase erro. O registro ajuda os responsáveis a entender o que aconteceu e acompanhar o caso.</p>
        <p>Em <strong>Nova Notificação</strong>, escreva um título breve e descreva o ocorrido e as ações já tomadas.</p>
        <Link to="/alertas" className="btn btn-outline-success">Ir para Notificações</Link>
      </div>
    </section>
  </>;
}
