import React, { createContext, useState, useEffect } from 'react';
import api from '../api-services/apiConfig';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [isAuthenticated, setIsAuthenticated] = useState(JSON.parse(localStorage.getItem('isAuthenticated')) || false);
  const [isAdmin, setIsAdmin] = useState(JSON.parse(localStorage.getItem('isAdmin')) || false);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const login = async ({ email, password }) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/auth/login?username=${email}&password=${password}`);
      const { user, token } = res.data;

      setUser(user);
      setToken(token);
      setIsAuthenticated(true);
      setIsAdmin(user?.role === 'ADMIN');
      setMessage('Login successful');

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('isAuthenticated', true);
      localStorage.setItem('isAdmin', user?.role === 'ADMIN');
      toast.success(res.data.message);
      if (user?.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', credentials);
      setMessage(res.data.message);
      toast.success(res.data.message);
      // navigate to login page
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const sendOtpToEmail = async (email) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/auth/send-otp-to-email?email=${email}`);
      setMessage(res.data.message);
      toast.success(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Sending OTP failed');
      toast.error(err.response?.data?.message || 'Sending OTP failed');
    }
    setLoading(false);
  };

  const verifyOtp = async ({ email, otp, password }) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/auth/verify-otp-and-set-password?email=${email}&otp=${otp}&password=${password}`);
      setMessage(res.data.message);
      toast.success(res.data.message);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      toast.error(err.response?.data?.message || 'Verification failed');
    }
    setLoading(false);
  };

  const verifyToken = async (tokenParam) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/auth/verify-token?token=${tokenParam}`);
      const { user } = res.data;

      setUser(user);
      setToken(token);
      setIsAuthenticated(true);
      setIsAdmin(user?.role === 'ADMIN');
      setMessage(res.data.message);

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', tokenParam);
      localStorage.setItem('isAuthenticated', true);
      localStorage.setItem('isAdmin', user?.role === 'ADMIN');
      toast.success(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Token verification failed');
      toast.error(err.response?.data?.message || 'Token verification failed');
      logout(); // optionally clear
    }
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setMessage('');
    setError('');
    localStorage.clear();
    // toast.success('Logged out successfully');
    navigate('/login');
    console.log("loggedout")
  };

  const clearLogs = () => {
    setError('');
    setMessage('');
  };

  const deleteAccount = async (password) => {
    setLoading(true);
    setError('');
    const user = JSON.parse(localStorage.getItem('user'));
    try {
      const res = await api.delete(`/user/delete/account?userId=${user.id}&password=${password}`);
      setMessage(res.data.message);
      toast.success(res.data.message);
      logout();
    } catch (err) {
      setError(err.response?.data?.message || 'Account deletion failed');
      toast.error(err.response?.data?.message || 'Account deletion failed');
    }
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        loading,
        error,
        message,
        login,
        register,
        deleteAccount,
        sendOtpToEmail,
        verifyOtp,
        verifyToken,
        logout,
        clearLogs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
