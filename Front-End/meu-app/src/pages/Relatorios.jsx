import { useNavigate, useParams } from 'react-router-dom';
import { PageTitle } from '../components/Feedback';
export default function Relatorios() {
  const navigate = useNavigate();
  return <>
    <PageTitle title="Criação de Relatórios">Escolha o que você precisa fazer.</PageTitle>
    <div className="row g-4 mb-4">
      <div className="col-12 col-md-6">
        <button type="button" className="report-choice card border-0 shadow-sm text-start w-100 h-100"
          onClick={() => navigate('/checklists/novo')}>
          <span className="card-body d-flex flex-column align-items-start p-4 p-lg-5">
            <span className="report-choice__icon mb-3" aria-hidden="true"><i className="bi bi-card-checklist" /></span>
            <span className="h4 report-choice__title mb-2">Fazer Checklist</span>
            <span className="text-muted">Responda aos 21 itens de segurança nas quatro etapas do checklist.</span>
            <span className="btn btn-verde mt-4">Criar checklist</span>
          </span>
        </button>
      </div>
      <div className="col-12 col-md-6">
        <button type="button" className="report-choice card border-0 shadow-sm text-start w-100 h-100"
          onClick={() => navigate('/alertas/novo')}>
          <span className="card-body d-flex flex-column align-items-start p-4 p-lg-5">
            <span className="report-choice__icon report-choice__icon--alert mb-3" aria-hidden="true"><i className="bi bi-bell" /></span>
            <span className="h4 report-choice__title mb-2">Criar Notificação de evento adverso</span>
            <span className="text-muted">Registre uma Notificação de evento adverso que precisa ser comunicada aos responsáveis.</span>
            <span className="btn btn-outline-success mt-4">Criar Notificação</span>
          </span>
        </button>
      </div>
    </div>
  </>;
}
