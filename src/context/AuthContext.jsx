import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const DEFAULT_USER = {
  name: 'Alex Mercer',
  email: 'alex.mercer@university.edu',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  studyGoal: 20,
  major: 'Computer Science',
  university: 'State Tech University'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => !!user);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('isOfflineMode');
      setIsAuthenticated(false);
    }
  }, [user]);

  const login = async (email, password) => {
    if (email && password) {
      // 1. Try backend authentication
      const apiRes = await api.auth.login(email, password);
      if (apiRes && apiRes.success) {
        setUser(apiRes.user);
        return { success: true };
      }

      // 2. Local fallback if backend is offline/error
      const newUser = {
        ...DEFAULT_USER,
        email: email,
        name: email.split('@')[0].replace('.', ' ')
      };
      setUser(newUser);
      return { success: true, fallback: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const loginDemo = () => {
    localStorage.setItem('isOfflineMode', 'true');
    setUser(DEFAULT_USER);
    return { success: true };
  };

  const register = async (name, email, password) => {
    if (name && email && password) {
      const apiRes = await api.auth.register(name, email, password);
      if (apiRes && apiRes.success) {
        setUser(apiRes.user);
        return { success: true };
      }

      // Fallback
      const newUser = {
        name,
        email,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
        studyGoal: 15,
        major: 'Undecided',
        university: 'University College'
      };
      setUser(newUser);
      return { success: true, fallback: true };
    }
    return { success: false, error: 'Please fill in all fields' };
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = async (updatedData) => {
    setUser((prev) => {
      if (!prev) return null;
      return { ...prev, ...updatedData };
    });

    // Fire background api call if server-connected
    await api.auth.updateProfile(updatedData).catch(() => {});
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, loginDemo, register, logout, updateProfile }}>
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
export default AuthContext;
