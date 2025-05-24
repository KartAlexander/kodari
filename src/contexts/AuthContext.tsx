import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'specialist' | 'startup_representative' | 'admin';
  // Add any other fields that the backend returns and you want to store
}

interface AuthContextType {
  user: User | null;
  token: string | null; // Added to store token in state as well
  loading: boolean;
  error: string | null; // Added for basic error handling
  login: (email: string, password: string) => Promise<boolean>; // Returns true on success
  register: (userData: Omit<User, 'id'> & {password: string}) => Promise<boolean>; // Returns true on success
  logout: () => void;
  clearError: () => void; // Utility to clear error messages
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          const response = await axios.get<{ user: User }>('/api/auth/me');
          setUser(response.data.user);
          setToken(storedToken);
        } catch (err) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
          setToken(null);
          console.error("Token validation failed or session expired:", err);
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await axios.post<{ token: string; user: User }>('/api/auth/login', { email, password });
      const { token: newToken, user: loggedInUser } = response.data;
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setUser(loggedInUser);
      setToken(newToken);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      console.error('Login error:', err);
      setError(errorMessage);
      return false;
    }
  };

  const register = async (userData: Omit<User, 'id'> & {password: string}): Promise<boolean> => {
    setError(null);
    const { username, email, password, role } = userData;
    try {
      // The backend register endpoint currently doesn't automatically log in the user or return a token.
      // It returns { message: 'User registered successfully.', user: userWithoutPassword }
      // For now, we'll assume successful registration means the user can now log in.
      // A more user-friendly approach might be for the backend to return a token upon registration.
      await axios.post('/api/auth/register', { username, email, password, role });
      // Optionally, automatically log in the user after successful registration:
      // return await login(email, password); 
      return true; // Indicate success, user should proceed to login
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      console.error('Registration error:', err);
      setError(errorMessage);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};