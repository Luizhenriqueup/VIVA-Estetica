import { useSyncExternalStore } from 'react';
import { readRecordView, subscribeRecordViews } from '../../services/recordViews';

export default function RecordNewBadge({ userId, type, recordId }) {
  const viewed = useSyncExternalStore(subscribeRecordViews,
    () => readRecordView(userId, type, recordId), () => null);
  return viewed === false ? <span className="badge painel-resumo__novo">Novo</span> : null;
}
