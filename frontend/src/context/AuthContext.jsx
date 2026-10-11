import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  /**
   * Decode a JWT payload without a library.
   * Returns the parsed claims object, or null on failure.
   */
  const parseJwt = (jwtToken) => {
    try {
      const base64Url = jwtToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    // response: { accessToken, email, role }
    const { accessToken, role } = response;

    // Parse JWT claims for userId (and any other embedded fields)
    const claims = parseJwt(accessToken);
    const userId = claims?.userId ?? null;
    // Some JWT payloads may include firstName/lastName — extract if present
    const firstName = claims?.firstName ?? null;
    const lastName = claims?.lastName ?? null;

    const userData = {
      id: userId,
      email: response.email || email,
      role: role || 'ROLE_USER',
      // Store name if available in token; will be refreshed from /me on profile load
      firstName,
      lastName,
    };

    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(accessToken);
    setUser(userData);

    return userData;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  /**
   * Merge partial profile data into the stored user object.
   * Called after a successful profile fetch/update to keep the
   * navbar and other UI in sync without re-login.
   */
  const updateUserProfile = (updatedFields) => {
    const newUserData = { ...user, ...updatedFields };
    localStorage.setItem('user', JSON.stringify(newUserData));
    setUser(newUserData);
  };

  const isAuthenticated = () => !!token;
  const isAdmin = () => user?.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        register,
        logout,
        updateUserProfile,
        isAuthenticated,
        isAdmin,
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
