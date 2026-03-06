import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    authAPI.getMe()
      .then(res => setUser(res.data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      setUser(user);
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}!`);
      const redirectMap = { admin: '/admin/dashboard', vendor: '/vendor/dashboard', client: '/dashboard' };
      return { success: true, redirectTo: redirectMap[user.role] || '/dashboard' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  }, []);

  const register = useCallback(async (data) => {
    try {
      const res = await authAPI.register(data);
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      setUser(user);
      if (user.role === 'vendor') {
        toast.success('Registration successful! Your account is pending admin approval.');
        return { success: true, redirectTo: '/vendor/dashboard' };
      }
      toast.success(`Welcome to ShadiSeva, ${user.full_name.split(' ')[0]}!`);
      return { success: true, redirectTo: '/dashboard' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    toast.info('You have been logged out.');
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
