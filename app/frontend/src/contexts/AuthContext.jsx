import React, { createContext, useState, useContext, useEffect } from 'react';
import cmsService from '../services/cms';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and token is valid
    const validateSession = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('jwt');
      
      if (storedUser && token) {
        try {
          // Validate token by making a test API call
          const isValid = await cmsService.validateToken();
          if (isValid) {
            setUser(JSON.parse(storedUser));
          } else {
            // Token invalid or expired, clear session
            localStorage.removeItem('user');
            localStorage.removeItem('jwt');
            setUser(null);
          }
        } catch (error) {
          // Token validation failed, clear session
          localStorage.removeItem('user');
          localStorage.removeItem('jwt');
          setUser(null);
        }
      }
      setLoading(false);
    };

    validateSession();
  }, []);

  const login = async (email, password) => {
    const data = await cmsService.login(email, password);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    cmsService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
