import React, { ReactNode } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import axios from 'axios';
import { AuthProvider, useAuth, User } from './AuthContext'; // Adjust path as necessary

// --- Mock axios ---
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
// --- End Mock axios ---

// --- Mock localStorage ---
let localStorageMock: { [key: string]: string } = {};

const mockLocalStorage = {
  getItem: jest.fn((key: string) => localStorageMock[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    localStorageMock[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete localStorageMock[key];
  }),
  clear: jest.fn(() => {
    localStorageMock = {};
  }),
};

// Apply the mock globally
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});
// --- End Mock localStorage ---

// Helper to wrap the hook with AuthProvider
const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext and useAuth Hook', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    mockedAxios.post.mockClear();
    mockedAxios.get.mockClear(); // If any GET requests are made by the context
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockLocalStorage.clear.mockClear();
    localStorageMock = {}; // Reset the in-memory store
    delete axios.defaults.headers.common['Authorization']; // Clear auth header
  });

  describe('Initial State', () => {
    it('should initially have user as null and loading as true, then false after effect', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      // The loading state depends on the useEffect in AuthProvider.
      // Initially, it might be true, then false after checking localStorage.
      // If AuthProvider's useEffect is synchronous for no token:
      // expect(result.current.loading).toBe(false); 
      // If it's async or involves microtasks, we might need waitFor:
      expect(result.current.loading).toBe(true); // Assuming initial state before useEffect fully runs

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.user).toBeNull(); // Still null if no token
    });

    it('should set Authorization header if token exists in localStorage on load', async () => {
      const token = 'existing-token';
      const user: User = { id: '2', name: 'Existing User', email: 'exist@example.com' };
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify({ token, user }));
      
      // Mock axios.get for the case where it tries to validate the token/fetch user
      // This depends on the implementation of AuthProvider's useEffect
      mockedAxios.get.mockResolvedValueOnce({ data: user }); // Or whatever endpoint it hits

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(axios.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
        expect(result.current.user).toEqual(user);
        expect(result.current.loading).toBe(false);
      });
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('auth-token');
    });
  });

  describe('Login Functionality', () => {
    it('should login successfully, update state, localStorage, and axios headers', async () => {
      const token = 'test-login-token';
      const userData: User = { id: '1', name: 'Test User', email: 'login@example.com' };
      mockedAxios.post.mockResolvedValueOnce({ data: { token, user: userData } });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('login@example.com', 'password');
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        { email: 'login@example.com', password: 'password' }
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth-token', JSON.stringify({ token, user: userData }));
      expect(axios.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
      expect(result.current.user).toEqual(userData);
      expect(result.current.loading).toBe(false);
    });

    it('should handle failed login, not update state, and throw error', async () => {
      const loginError = new Error('Login failed: Invalid credentials');
      mockedAxios.post.mockRejectedValueOnce(loginError);

      const { result } = renderHook(() => useAuth(), { wrapper });
      let caughtError;
      try {
        await act(async () => {
          await result.current.login('fail@example.com', 'wrongpassword');
        });
      } catch (e) {
        caughtError = e;
      }
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        { email: 'fail@example.com', password: 'wrongpassword' }
      );
      expect(caughtError).toEqual(loginError); // Or specific error type if AuthContext throws custom errors
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
      expect(axios.defaults.headers.common['Authorization']).toBeUndefined();
      expect(result.current.user).toBeNull();
      // Loading state might briefly be true then false, or just false if error is immediate
      await waitFor(() => expect(result.current.loading).toBe(false));
    });
  });

  describe('Register Functionality', () => {
    it('should register successfully, update state, localStorage, and axios headers', async () => {
      const token = 'test-register-token';
      const userData: User = { id: '3', name: 'New User', email: 'register@example.com' };
      mockedAxios.post.mockResolvedValueOnce({ data: { token, user: userData } });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.register('register@example.com', 'securepassword', 'New User');
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/auth/register`,
        { email: 'register@example.com', password: 'securepassword', name: 'New User' }
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth-token', JSON.stringify({ token, user: userData }));
      expect(axios.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
      expect(result.current.user).toEqual(userData);
      expect(result.current.loading).toBe(false);
    });

    it('should handle failed registration, not update state, and throw error', async () => {
      const registerError = new Error('Registration failed: Email already exists');
      mockedAxios.post.mockRejectedValueOnce(registerError);

      const { result } = renderHook(() => useAuth(), { wrapper });
      let caughtError;
      try {
        await act(async () => {
          await result.current.register('exist@example.com', 'password123', 'Existing Name');
        });
      } catch (e) {
        caughtError = e;
      }

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/auth/register`,
        { email: 'exist@example.com', password: 'password123', name: 'Existing Name' }
      );
      expect(caughtError).toEqual(registerError);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
      expect(axios.defaults.headers.common['Authorization']).toBeUndefined();
      expect(result.current.user).toBeNull();
       await waitFor(() => expect(result.current.loading).toBe(false));
    });
  });

  describe('Logout Functionality', () => {
    it('should logout successfully, clear state, localStorage, and axios headers', async () => {
      // First, simulate a login
      const token = 'test-logout-token';
      const userData: User = { id: '4', name: 'Logout User', email: 'logout@example.com' };
      mockLocalStorage.setItem('auth-token', JSON.stringify({ token, user: userData }));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Initial render simulates user being logged in from a previous session
      const { result, rerender } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial load effect to complete and set user
      await waitFor(() => {
        expect(result.current.user).toEqual(userData); 
        expect(result.current.loading).toBe(false);
      });
      
      // Call logout
      await act(async () => {
        result.current.logout();
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth-token');
      expect(axios.defaults.headers.common['Authorization']).toBeUndefined();
      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false); // Should be false after logout
    });
  });

  describe('useAuth Hook Usage', () => {
    it('should throw error if useAuth is called outside of AuthProvider', () => {
      // Suppress console.error for this specific test, as React will log the error
      const originalError = console.error;
      console.error = jest.fn();
      
      let errorThrown = false;
      try {
        renderHook(() => useAuth());
      } catch (e: any) {
        if (e.message.includes('useAuth must be used within an AuthProvider')) {
          errorThrown = true;
        }
      }
      expect(errorThrown).toBe(true);
      
      console.error = originalError; // Restore console.error
    });

    it('should provide context values when used within AuthProvider', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.user).toBeNull();
      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.register).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Loading State', () => {
    it('should be true initially and false after useEffect (no token)', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      // Initial state might be loading=true before useEffect runs, or AuthProvider sets it.
      // If AuthProvider sets loading to true in its initial state:
      expect(result.current.loading).toBe(true);
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should be true initially, then false after useEffect (with token and user fetch)', async () => {
      const token = 'loading-test-token';
      const user = { id: 'loadingUser', name: 'Loading Test', email: 'load@test.com' };
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify({ token, user }));
      // Assuming AuthProvider's useEffect might try to validate token / fetch user
      // For this test, let's assume it just sets the user from localStorage
      // If it makes an API call, that call should be mocked.
      // mockedAxios.get.mockResolvedValueOnce({ data: user });

      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.loading).toBe(true); // Initial state
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toEqual(user);
      });
    });
  });
});
