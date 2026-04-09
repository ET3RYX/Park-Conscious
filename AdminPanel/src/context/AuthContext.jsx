import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedSession = localStorage.getItem('adminUser');
    if (savedSession) {
      try {
        const data = JSON.parse(savedSession);
        // data contains { user, token }. We set admin to data.user
        setAdmin(data.user || data);
      } catch (e) {
        console.error("Session corruption detected");
        localStorage.removeItem('adminUser');
      }
    }
    setLoading(false);
  }, []);

  const login = (sessionData) => {
    setAdmin(sessionData.user);
    localStorage.setItem('adminUser', JSON.stringify(sessionData));
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('adminUser');
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
