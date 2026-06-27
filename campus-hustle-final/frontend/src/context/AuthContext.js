// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

const loadFromStorage = () => {
  try {
    const user  = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    return { user: user || null, token: token || null };
  } catch {
    return { user: null, token: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(loadFromStorage);
  const [bootstrapping, setBootstrapping] = useState(Boolean(localStorage.getItem('token')));
  const [authNotice, setAuthNotice] = useState('');

  const login = useCallback((user, token) => {
    localStorage.setItem('user',  JSON.stringify(user));
    localStorage.setItem('token', token);
    setSession({ user, token });
    setAuthNotice('');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setSession({ user: null, token: null });
  }, []);

  const updateUser = useCallback((user) => {
    localStorage.setItem('user', JSON.stringify(user));
    setSession((current) => ({ ...current, user }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setBootstrapping(false);
        return;
      }

      try {
        const res = await authApi.me();
        if (!cancelled) updateUser(res.data.user);
      } catch (err) {
        if (!cancelled) {
          logout();
          setAuthNotice('Your session expired. Please sign in again.');
        }
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    };

    bootstrap();
    return () => { cancelled = true; };
  }, [logout, updateUser]);

  useEffect(() => {
    const onUnauthorized = (event) => {
      logout();
      setAuthNotice(event.detail?.message || 'Please sign in to continue.');
    };

    window.addEventListener('hustlegrad:unauthorized', onUnauthorized);
    return () => window.removeEventListener('hustlegrad:unauthorized', onUnauthorized);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ ...session, login, logout, updateUser, bootstrapping, authNotice, setAuthNotice }}>
      {children}
    </AuthContext.Provider>
  );
};

/** Hook — throws if used outside <AuthProvider> */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
