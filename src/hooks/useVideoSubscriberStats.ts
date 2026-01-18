import { useState, useEffect, useCallback } from 'react';
import { fetchVideoSubscriberStats, type VideoSubscriberStats } from '@/services/youtubeAnalytics';

interface UseVideoSubscriberStatsReturn {
  stats: Map<string, VideoSubscriberStats>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useVideoSubscriberStats(
  isAuthenticated: boolean = false,
  days: number = 365
): UseVideoSubscriberStatsReturn {
  const [stats, setStats] = useState<Map<string, VideoSubscriberStats>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchVideoSubscriberStats(days);
        if (isMounted) {
          setStats(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : '無法取得影片訂閱數據');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, days]);

  const refetch = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchVideoSubscriberStats(days);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '無法取得影片訂閱數據');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, days]);

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
}
