import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('careflow_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('careflow_user');
    const savedToken = localStorage.getItem('careflow_token');

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        localStorage.removeItem('careflow_user');
        localStorage.removeItem('careflow_token');
      }
    }
    setLoading(false);
  }, []);

  const getDashboardPath = (role) => {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'RECEPTIONIST':
        return '/receptionist/dashboard';
      case 'DOCTOR':
        return '/doctor/dashboard';
      case 'LAB_TECHNICIAN':
        return '/lab/dashboard';
      case 'PATIENT':
        return '/patient/dashboard';
      default:
        return '/login';
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    const data = response.data;

    const userData = {
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      phone: data.phone
    };

    localStorage.setItem('careflow_token', data.token);
    localStorage.setItem('careflow_user', JSON.stringify(userData));

    setToken(data.token);
    setUser(userData);

    return {
      user: userData,
      redirectPath: getDashboardPath(data.role)
    };
  };

  const register = async (patientData) => {
    const response = await api.post('/api/auth/register', patientData);
    const data = response.data;

    const userData = {
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      phone: data.phone
    };

    localStorage.setItem('careflow_token', data.token);
    localStorage.setItem('careflow_user', JSON.stringify(userData));

    setToken(data.token);
    setUser(userData);

    return {
      user: userData,
      redirectPath: '/patient/dashboard'
    };
  };

  const logout = () => {
    localStorage.removeItem('careflow_token');
    localStorage.removeItem('careflow_user');
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    getDashboardPath,
    isAdmin: user?.role === 'ADMIN',
    isReceptionist: user?.role === 'RECEPTIONIST',
    isDoctor: user?.role === 'DOCTOR',
    isLabTech: user?.role === 'LAB_TECHNICIAN',
    isPatient: user?.role === 'PATIENT'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
