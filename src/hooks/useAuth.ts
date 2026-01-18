import { useState, useEffect, useCallback } from 'react';
import {
  getAuthUrl,
  clearTokens,
  getValidAccessToken,
} from '@/services/auth';

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  accessToken: string | null;
}

export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    const token = await getValidAccessToken();
    setAccessToken(token);
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(() => {
    window.location.href = getAuthUrl();
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setAccessToken(null);
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    accessToken,
  };
}
