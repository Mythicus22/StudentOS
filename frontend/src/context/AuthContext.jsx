import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
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
    console.log('[AuthContext] Checking authentication status');
    const token = document.cookie.includes('token=');
    console.log('[AuthContext] Token found:', token);
    setIsAuthenticated(token);
    setLoading(false);
  }, []);

  useEffect(() => {
    console.log('[AuthContext] Dark mode changed:', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  const login = async (username, password) => {
    console.log('[AuthContext] Login attempt for:', username);
    try {
      const response = await authAPI.login(username, password);
      console.log('[AuthContext] Login successful:', response.data);
      setIsAuthenticated(true);
      setUsername(username);
      return { success: true };
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      throw error;
    }
  };

  const signup = async (username, password) => {
    console.log('[AuthContext] Signup attempt for:', username);
    try {
      const response = await authAPI.signup(username, password);
      console.log('[AuthContext] Signup successful:', response.data);
      return { success: true };
    } catch (error) {
      console.error('[AuthContext] Signup failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('[AuthContext] Logout attempt');
    try {
      await authAPI.logout();
      console.log('[AuthContext] Logout successful');
      setIsAuthenticated(false);
      setUsername('');
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
    }
  };

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      username,
      loading,
      darkMode,
      login,
      signup,
      logout,
      toggleTheme,
      setUsername
    }}>
      {children}
    </AuthContext.Provider>
  );
};
