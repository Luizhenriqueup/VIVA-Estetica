import { useEffect, useId, useRef } from 'react';
import '../styles/Checklist.css';

export default function DeleteConfirmation({ record, pending, onCancel, onConfirm }) {
  const dialog = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!record) return;
    const element = dialog.current;
    const previousFocus = document.activeElement;
    element.showModal();
    return () => {
      element.close();
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [record]);

  if (!record) return null;
  return <dialog ref={dialog} className="checklist-dialog p-0" aria-labelledby={titleId} aria-describedby={descriptionId}
    aria-busy={pending} onCancel={(event) => { event.preventDefault(); onCancel(); }}>
    <div className="p-4">
      <h2 id={titleId} className="h4">Confirmar exclusão</h2>
      <div id={descriptionId}>
        <p>Tem certeza de que deseja excluir este registro?</p>
        <p className="small text-muted text-break">Será excluído {record.description}. Esta ação não pode ser desfeita.</p>
      </div>
      <div className="d-flex justify-content-end flex-wrap gap-2">
        <button type="button" autoFocus className="btn btn-outline-success" disabled={pending} onClick={onCancel}>Cancelar</button>
        <button type="button" className="btn btn-outline-danger" disabled={pending} onClick={onConfirm}>{pending ? 'Excluindo…' : 'Excluir'}</button>
      </div>
    </div>
  </dialog>;
}
