import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/api';
import { AuthState, LoginRequest, RegisterRequest, User } from '../types';
import jwt_decode from 'jwt-decode';

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const AuthContext = createContext<AuthContextType>({
  ...defaultState,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface DecodedToken {
  userId: string;
  username: string;
  exp: number;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    ...defaultState,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: true,
  });

  useEffect(() => {
    // Check if token exists and is valid
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const decoded = jwt_decode<DecodedToken>(token);
        const currentTime = Date.now() / 1000;
        
        // Check if token is expired
        if (decoded.exp < currentTime) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setState({
            ...defaultState,
            isLoading: false,
          });
        } else {
          // Get user from localStorage if available
          const storedUser = localStorage.getItem('user');
          const user = storedUser ? JSON.parse(storedUser) : null;
          
          setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        }
      } catch (err) {
        // Token is invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setState({
          ...defaultState,
          isLoading: false,
        });
      }
    } else {
      setState({
        ...defaultState,
        isLoading: false,
      });
    }
  }, []);

  const login = async (data: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authService.login(data);
      
      // Extract user info from token
      const decoded = jwt_decode<DecodedToken>(response.token);
      
      const user: User = {
        id: decoded.userId,
        username: decoded.username,
        createdAt: new Date().toISOString(),
      };
      
      // Save to localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setState({
        user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      setState({
        ...defaultState,
        isLoading: false,
        error: err.response?.data?.error || 'Failed to login',
      });
    }
  };

  const register = async (data: RegisterRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authService.register(data);
      await login({ username: data.username, password: data.password });
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.response?.data?.error || 'Failed to register',
      }));
    }
  };

  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await authService.logout();
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      setState({
        ...defaultState,
        isLoading: false,
      });
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
