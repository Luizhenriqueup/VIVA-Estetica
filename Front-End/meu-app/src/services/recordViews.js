const PREFIX = 'viva.record-view.v1:';
const CHANGE_EVENT = 'viva:record-view';

function recordKey(userId, type, recordId) {
  if (typeof userId !== 'string' || !userId || typeof recordId !== 'string' || !recordId ||
      !['checklist', 'notification'].includes(type)) return null;
  return PREFIX + [userId, type, recordId].map(encodeURIComponent).join(':');
}

export function readRecordView(userId, type, recordId, storage) {
  const key = recordKey(userId, type, recordId);
  if (!key) return null;
  try {
    return (storage ?? window.localStorage).getItem(key) === '1';
  } catch {
    return null;
  }
}

export function markRecordViewed(userId, type, recordId, storage) {
  const key = recordKey(userId, type, recordId);
  if (!key) return false;
  try {
    const target = storage ?? window.localStorage;
    if (target.getItem(key) === '1') return true;
    target.setItem(key, '1');
  } catch {
    return false;
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(CHANGE_EVENT));
  return true;
}

export function subscribeRecordViews(listener) {
  const onStorage = (event) => {
    if (event.key === null || event.key?.startsWith(PREFIX)) listener();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}
