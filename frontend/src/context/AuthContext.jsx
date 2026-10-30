import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('wastewise_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('wastewise_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('wastewise_token');
      if (storedToken) {
        try {
          const res = await authApi.getCurrentUser();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('wastewise_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error('Session expired or invalid', err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (emailOrCreds, password) => {
    const credentials = password ? { email: emailOrCreds, password } : emailOrCreds;
    const res = await authApi.login(credentials);
    if (res.success && res.data) {
      const { token: jwtToken, ...userData } = res.data;
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('wastewise_token', jwtToken);
      localStorage.setItem('wastewise_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.success && res.data) {
      const { token: jwtToken, ...userInfo } = res.data;
      setToken(jwtToken);
      setUser(userInfo);
      localStorage.setItem('wastewise_token', jwtToken);
      localStorage.setItem('wastewise_user', JSON.stringify(userInfo));
      return userInfo;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('wastewise_token');
    localStorage.removeItem('wastewise_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        role: user?.role,
        isDonor: user?.role === 'ROLE_DONOR',
        isRecipient: user?.role === 'ROLE_RECIPIENT',
        isVolunteer: user?.role === 'ROLE_VOLUNTEER',
        isAdmin: user?.role === 'ROLE_ADMIN',
        loading,
        login,
        register,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

