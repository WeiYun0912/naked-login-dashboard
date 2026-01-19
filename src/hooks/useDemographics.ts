import { useState, useEffect, useCallback } from 'react';
import {
  fetchDemographics,
  fetchGeography,
  type DemographicData,
  type GeographyData,
} from '@/services/youtubeAnalytics';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface UseDemographicsReturn {
  demographics: DemographicData[];
  geography: GeographyData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDemographics(
  dateRange: DateRange,
  isAuthenticated: boolean = false
): UseDemographicsReturn {
  const [demographics, setDemographics] = useState<DemographicData[]>([]);
  const [geography, setGeography] = useState<GeographyData[]>([]);
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
        const [demoData, geoData] = await Promise.all([
          fetchDemographics(dateRange.startDate, dateRange.endDate),
          fetchGeography(dateRange.startDate, dateRange.endDate),
        ]);

        if (isMounted) {
          setDemographics(demoData);
          setGeography(geoData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : '無法取得觀眾數據');
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
      const [demoData, geoData] = await Promise.all([
        fetchDemographics(dateRange.startDate, dateRange.endDate),
        fetchGeography(dateRange.startDate, dateRange.endDate),
      ]);

      setDemographics(demoData);
      setGeography(geoData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '無法取得觀眾數據');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate, isAuthenticated]);

  return {
    demographics,
    geography,
    isLoading,
    error,
    refetch,
  };
}
