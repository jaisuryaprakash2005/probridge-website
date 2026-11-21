import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, login as apiLogin, register as apiRegister, phoneLogin as apiPhoneLogin } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('pb_token');
    if (token) {
      getMe()
        .then(({ data }) => setUser(data.user))
        .catch(() => localStorage.removeItem('pb_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await apiLogin({ email, password });
    localStorage.setItem('pb_token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const loginWithPhone = useCallback(async (name, phone, otp) => {
    const { data } = await apiPhoneLogin({ name, phone, otp });
    localStorage.setItem('pb_token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password, phone) => {
    const { data } = await apiRegister({ name, email, password, phone });
    localStorage.setItem('pb_token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pb_token');
    setUser(null);
  }, []);

  const updateUser = useCallback((newUserData) => {
    setUser((prev) => ({ ...prev, ...newUserData }));
  }, []);

  const openLoginModal = useCallback(() => setLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setLoginModalOpen(false), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithPhone,
        register,
        logout,
        updateUser,
        loginModalOpen,
        openLoginModal,
        closeLoginModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

