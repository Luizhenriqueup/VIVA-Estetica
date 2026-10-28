import { useRef, useState } from 'react';
import { useAuth } from '../contexts/auth';
import { canDeleteRecords } from '../services/api';
import useResource from './useResource';

export default function useRecordDeletion(removeRecord, onDeleted) {
  const { api, session } = useAuth();
  const profile = useResource(api.me);
  const [deleting, setDeleting] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState(null);
  const locked = useRef(false);
  const canDelete = !profile.loading && !profile.error && profile.data?.userId === session?.userId && canDeleteRecords(profile.data);

  function remove(id, description) {
    if (!canDelete || locked.current) return;
    setConfirmation({ id, description });
  }

  function cancel() {
    if (!locked.current) setConfirmation(null);
  }

  async function confirm() {
    if (!canDelete || locked.current || !confirmation) return;
    locked.current = true;
    setDeleting(confirmation.id);
    setError(null);
    try {
      await removeRecord(confirmation.id);
      onDeleted();
    } catch (err) {
      setError(err);
      if (err.status === 403) profile.reload();
    } finally {
      locked.current = false;
      setDeleting(null);
      setConfirmation(null);
    }
  }

  return { canDelete, deleting, confirmation, error: error || profile.error, remove, cancel, confirm };
}
