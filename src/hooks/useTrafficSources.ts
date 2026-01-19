import { useState, useEffect, useCallback } from 'react';
import { fetchTrafficSources, type TrafficSource } from '@/services/youtubeAnalytics';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface UseTrafficSourcesReturn {
  trafficSources: TrafficSource[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTrafficSources(
  dateRange: DateRange,
  isAuthenticated: boolean = false
): UseTrafficSourcesReturn {
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
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
        const data = await fetchTrafficSources(dateRange.startDate, dateRange.endDate);
        if (isMounted) {
          setTrafficSources(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : '無法取得流量來源數據');
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
  }, [dateRange.startDate, dateRange.endDate, isAuthenticated]);

  const refetch = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchTrafficSources(dateRange.startDate, dateRange.endDate);
      setTrafficSources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '無法取得流量來源數據');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate, isAuthenticated]);

  return {
    trafficSources,
    isLoading,
    error,
    refetch,
  };
}
