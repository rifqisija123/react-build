import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  google_id?: string;
  github_id?: string;
  created_at?: string;
  updated_at?: string;
  portfolio?: {
    id: number;
    hide_from_search: boolean;
  } | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; errors?: Record<string, string[]>; twoFactorRequired?: boolean; twoFactorToken?: string; rememberMe?: boolean }>;
  loginWithGoogle: (idToken: string) => Promise<{ success: boolean; errors?: Record<string, string[]>; twoFactorRequired?: boolean; twoFactorToken?: string }>;
  loginWithGitHub: () => Promise<{ success: boolean; errors?: Record<string, string[]> }>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
  setAuthData: (user: User, token: string) => void;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('auth_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(() => !localStorage.getItem('auth_token'));
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // On mount: check for existing session
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');

      if (storedToken) {
        // Verify token is still valid via /me in background
        try {
          const response = await api.get('/me');
          setUser(response.data.user);
          localStorage.setItem('auth_user', JSON.stringify(response.data.user));
        } catch {
          // Token is invalid, try remember cookie
          logoutLocally();
          await tryRememberLogin();
        }
      } else {
        // No stored token, try remember cookie
        await tryRememberLogin();
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const logoutLocally = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const tryRememberLogin = async () => {
    try {
      const response = await api.post('/check-remember');
      if (response.data.authenticated) {
        const { user: remUser, token: remToken } = response.data;
        setUser(remUser);
        setToken(remToken);
        localStorage.setItem('auth_token', remToken);
        localStorage.setItem('auth_user', JSON.stringify(remUser));
      }
    } catch {
      // No valid remember cookie, remain unauthenticated
    }
  };

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean
  ): Promise<{ success: boolean; errors?: Record<string, string[]>; twoFactorRequired?: boolean; twoFactorToken?: string; rememberMe?: boolean }> => {
    try {
      const response = await api.post('/login', {
        email,
        password,
        remember_me: rememberMe,
      });

      // Check if 2FA is required
      if (response.data.two_factor_required) {
        return {
          success: false,
          twoFactorRequired: true,
          twoFactorToken: response.data.two_factor_token,
          rememberMe: response.data.remember_me,
        };
      }

      const { user: loggedInUser, token: newToken } = response.data;
      setUser(loggedInUser);
      setToken(newToken);
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_user', JSON.stringify(loggedInUser));

      return { success: true };
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: { errors?: Record<string, string[]> } } };
      if (axiosError.response?.status === 422) {
        return { success: false, errors: axiosError.response.data?.errors };
      }
      return {
        success: false,
        errors: { general: ['Something went wrong. Please try again later.'] },
      };
    }
  };

  const loginWithGoogle = async (
    code: string
  ): Promise<{ success: boolean; errors?: Record<string, string[]>; twoFactorRequired?: boolean; twoFactorToken?: string }> => {
    try {
      const response = await api.post('/auth/google', {
        code,
      });

      // Check if 2FA is required
      if (response.data.two_factor_required) {
        return {
          success: false,
          twoFactorRequired: true,
          twoFactorToken: response.data.two_factor_token,
        };
      }

      const { user: loggedInUser, token: newToken } = response.data;
      setUser(loggedInUser);
      setToken(newToken);
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_user', JSON.stringify(loggedInUser));

      return { success: true };
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: { errors?: Record<string, string[]> } } };
      if (axiosError.response?.data?.errors) {
        return { success: false, errors: axiosError.response.data.errors };
      }
      return {
        success: false,
        errors: { general: ['Google login failed. Please try again.'] },
      };
    }
  };

  const loginWithGitHub = async (): Promise<{ success: boolean; errors?: Record<string, string[]> }> => {
    try {
      const response = await api.get('/me');
      const loggedInUser = response.data.user;
      setUser(loggedInUser);
      localStorage.setItem('auth_user', JSON.stringify(loggedInUser));
      setToken('httponly-cookie');
      localStorage.setItem('auth_token', 'httponly-cookie');

      return { success: true };
    } catch {
      return {
        success: false,
        errors: { general: ['GitHub login failed. Please try again.'] },
      };
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post('/logout');
    } catch {
      // Ignore errors during logout
    } finally {
      logoutLocally();
      // Reset isLoggingOut after a brief delay to allow routing to happen
      setTimeout(() => setIsLoggingOut(false), 500);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
  };

  const setAuthData = (authUser: User, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('auth_user', JSON.stringify(authUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        loginWithGoogle,
        loginWithGitHub,
        logout,
        updateUser,
        setAuthData,
        isLoggingOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
