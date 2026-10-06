import { useCallback, useEffect, useMemo, useState } from 'react';
import { createApi } from '../services/api';
import { clearSession, readSession, saveSession } from '../services/session';
import { AuthContext } from './auth';
export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  const [notice, setNotice] = useState('');
  const endSession = useCallback((message = '') => {
    clearSession(); setSession(null); setNotice(message);
  }, []);
  const api = useMemo(() => createApi({
    baseUrl: import.meta.env.VITE_API_BASE_URL || '',
    getSession: () => session,
    onUnauthorized: (token) => {
      // Ignorar respostas atrasadas de uma sessão substituída por outro login.
      if (!token || readSession()?.token === token) endSession('Sua sessão expirou. Entre novamente.');
    },
  }), [endSession, session]);
  useEffect(() => {
    if (!session) return;
    const check = () => { if (Date.parse(session.expiresAt) <= Date.now()) endSession('Sua sessão expirou. Entre novamente.'); };
    const timer = setTimeout(check, Math.max(0, Date.parse(session.expiresAt) - Date.now()));
    window.addEventListener('focus', check);
    return () => { clearTimeout(timer); window.removeEventListener('focus', check); };
  }, [session, endSession]);
  async function login(credentials) {
    const result = await api.login(credentials);
    const saved = saveSession(result);
    setSession(saved); setNotice('');
  }
  async function logout() {
    let message = '';
    try { await api.logout(); } catch (error) {
      if (error.status !== 401) message = 'Você saiu deste navegador, mas não foi possível encerrar o token no servidor. Ele permanece válido até expirar.';
    } finally { endSession(message); }
  }
  return <AuthContext.Provider value={{ session, api, login, logout, endSession, notice }}>{children}</AuthContext.Provider>;
}
