import { useState, useEffect, useCallback } from 'react';
import { fetchVideoAnalytics, type VideoAnalytics } from '@/services/youtubeAnalytics';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface UseVideoAnalyticsReturn {
  analytics: VideoAnalytics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useVideoAnalytics(
  videoId: string,
  dateRange: DateRange,
  isAuthenticated: boolean = false
): UseVideoAnalyticsReturn {
  const [analytics, setAnalytics] = useState<VideoAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !videoId) {
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchVideoAnalytics(videoId, dateRange.startDate, dateRange.endDate);
        if (isMounted) {
          setAnalytics(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : '無法取得影片分析數據');
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
  }, [videoId, dateRange.startDate, dateRange.endDate, isAuthenticated]);

  const refetch = useCallback(async () => {
    if (!isAuthenticated || !videoId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchVideoAnalytics(videoId, dateRange.startDate, dateRange.endDate);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '無法取得影片分析數據');
    } finally {
      setIsLoading(false);
    }
  }, [videoId, dateRange.startDate, dateRange.endDate, isAuthenticated]);

  return {
    analytics,
    isLoading,
    error,
    refetch,
  };
}
