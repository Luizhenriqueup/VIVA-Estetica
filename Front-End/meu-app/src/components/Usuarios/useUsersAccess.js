import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/auth';
import useResource from '../../hooks/useResource';

export default function useUsersAccess() {
  const { api, session } = useAuth();
  const resource = useResource(api.me);
  const [updated, setUpdated] = useState(null);
  useEffect(() => {
    const refresh = (event) => {
      if (event.detail?.userId === session?.userId) setUpdated({ api, user: event.detail });
    };
    window.addEventListener('viva:users-access', refresh);
    return () => {
      window.removeEventListener('viva:users-access', refresh);
    };
  }, [api, session?.userId]);
  const user = updated?.api === api ? updated.user : resource.data;
  const permanent = user?.isTemp === false;
  return { ...resource,
    allowed: !resource.loading && !resource.error && permanent && user.flags.some((flag) => flag === 'Admin' || flag === 'Gerente'),
    admin: !resource.loading && !resource.error && permanent && user.flags.includes('Admin'),
  };
}
