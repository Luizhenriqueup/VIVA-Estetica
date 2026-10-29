import { useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/auth';
import { isCompleteQuestionnaire } from '../data/checklist';
import { markRecordViewed } from '../services/recordViews';
import useResource from './useResource';

export default function useViewedRecord(type, id) {
  const { api, session } = useAuth();
  const userId = session?.userId;
  const loader = useCallback(async (signal) => {
    const record = await (type === 'checklist' ? api.report(id, signal) : api.alert(id, signal));
    if (record?.id !== id || (type === 'checklist' && record.userId !== userId)) {
      throw new Error('Não foi possível confirmar o registro solicitado.');
    }
    return { record, userId, api };
  }, [api, id, type, userId]);
  const resource = useResource(loader);
  const payload = resource.data;
  const current = payload?.api === api && payload?.userId === userId && payload?.record?.id === id;

  useEffect(() => {
    if (resource.loading || resource.error || !current) return;
    if (type === 'checklist' && (payload.record.userId !== userId ||
        !isCompleteQuestionnaire(payload.record.questionnaire))) return;
    if (type === 'notification' && typeof payload.record.title !== 'string') return;
    markRecordViewed(userId, type, id);
  }, [resource.loading, resource.error, current, payload, type, userId, id]);

  return { ...resource,
    data: current ? payload.record : null,
    loading: resource.loading || (!!payload && !current),
  };
}
