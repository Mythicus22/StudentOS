import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    authAPI.me()
      .then(res => {
        setUsername(res.data.data.username);
        setIsAuthenticated(true);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setUsername('');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : '');
    if (!darkMode) document.documentElement.removeAttribute('data-theme');
  }, [darkMode]);

  const login = async (username, password) => {
    await authAPI.login(username, password);
    const res = await authAPI.me();
    setUsername(res.data.data.username);
    setIsAuthenticated(true);
  };

  const signup = async (username, password) => {
    await authAPI.signup(username, password);
    await authAPI.login(username, password);
    const res = await authAPI.me();
    setUsername(res.data.data.username);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch {}
    setIsAuthenticated(false);
    setUsername('');
  };

  const toggleTheme = () => setDarkMode(prev => !prev);

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, loading, darkMode, login, signup, logout, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};
