import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, setAuthToken } from '@/api/client';

const TOKEN_KEY = 'dealsense_token';

export type AuthUser = { id: number; email: string; name: string };

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      api
        .get<{ user: AuthUser }>('/api/auth/me')
        .then((r) => setUser(r.data.user))
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setAuthToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setAuthToken(null);
      setLoading(false);
    }
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: AuthUser }>('/api/auth/login', {
      email,
      password,
    });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setAuthToken(res.data.token);
    setUser(res.data.user);
    setToken(res.data.token);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const res = await api.post<{ token: string; user: AuthUser }>('/api/auth/register', {
      email,
      password,
      name,
    });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setAuthToken(res.data.token);
    setUser(res.data.user);
    setToken(res.data.token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, loading, login, register, logout }),
    [token, user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
