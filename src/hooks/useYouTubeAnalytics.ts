import { useState, useEffect, useCallback } from 'react';
import type { AnalyticsData } from '@/types/youtube';
import { fetchAnalyticsData, fetchDailyViews, fetchSubscriberChange } from '@/services/youtubeAnalytics';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface UseYouTubeAnalyticsReturn {
  analytics: AnalyticsData | null;
  dailyViews: Array<{ date: string; views: number }>;
  subscriberChange: Array<{ date: string; net: number; gained: number; lost: number }>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useYouTubeAnalytics(
  dateRange: DateRange,
  isAuthenticated: boolean = false
): UseYouTubeAnalyticsReturn {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [dailyViews, setDailyViews] = useState<Array<{ date: string; views: number }>>([]);
  const [subscriberChange, setSubscriberChange] = useState<Array<{ date: string; net: number; gained: number; lost: number }>>([]);
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
        const [analyticsData, viewsData, subsData] = await Promise.all([
          fetchAnalyticsData(dateRange.startDate, dateRange.endDate),
          fetchDailyViews(dateRange.startDate, dateRange.endDate),
          fetchSubscriberChange(dateRange.startDate, dateRange.endDate),
        ]);

        if (isMounted) {
          setAnalytics(analyticsData);
          setDailyViews(viewsData);
          setSubscriberChange(subsData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : '無法取得分析數據');
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
      setError('請先登入以查看分析數據');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [analyticsData, viewsData, subsData] = await Promise.all([
        fetchAnalyticsData(dateRange.startDate, dateRange.endDate),
        fetchDailyViews(dateRange.startDate, dateRange.endDate),
        fetchSubscriberChange(dateRange.startDate, dateRange.endDate),
      ]);

      setAnalytics(analyticsData);
      setDailyViews(viewsData);
      setSubscriberChange(subsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '無法取得分析數據');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate, isAuthenticated]);

  return {
    analytics,
    dailyViews,
    subscriberChange,
    isLoading,
    error,
    refetch,
  };
}
