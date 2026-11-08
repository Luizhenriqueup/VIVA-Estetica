import { useEffect, useId, useRef } from 'react';
import '../../styles/Checklist.css';

export default function ModalUsuarios({ title, children, pending = false, onCancel }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return <dialog
    ref={ref}
    className="checklist-dialog p-0"
    aria-labelledby={titleId}
    aria-busy={pending}
    onCancel={(event) => { event.preventDefault(); if (!pending) onCancel(); }}
  >
    <div className="p-4">
      <h2 id={titleId} className="h4 mb-3">{title}</h2>
      {children}
    </div>
  </dialog>;
}
