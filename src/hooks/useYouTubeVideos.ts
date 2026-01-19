import { useState, useEffect, useMemo } from 'react';
import type { Video, SortOption, SortDirection } from '@/types/youtube';
import { fetchAllChannelVideos } from '@/services/youtube';

interface UseYouTubeVideosReturn {
  videos: Video[];
  isLoading: boolean;
  error: string | null;
  sortOption: SortOption;
  sortDirection: SortDirection;
  setSortOption: (option: SortOption) => void;
  setSortDirection: (direction: SortDirection) => void;
  refetch: () => Promise<void>;
  loadingProgress: number;
}

const CACHE_KEY = 'youtube_videos_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 小時

interface CachedData {
  videos: Video[];
  timestamp: number;
}

function getCachedVideos(): Video[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CachedData = JSON.parse(cached);
    const now = Date.now();

    // 檢查快取是否過期
    if (now - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data.videos;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

function setCachedVideos(videos: Video[]): void {
  try {
    const data: CachedData = {
      videos,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing cache:', error);
  }
}

export function useYouTubeVideos(
  channelId?: string
): UseYouTubeVideosReturn {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      // 先嘗試從快取讀取
      const cached = getCachedVideos();
      if (cached && isMounted) {
        setVideos(cached);
        setIsLoading(false);
        return;
      }

      // 沒有快取，從 API 獲取
      setIsLoading(true);
      setError(null);
      setLoadingProgress(0);

      try {
        const data = await fetchAllChannelVideos(channelId, (count) => {
          if (isMounted) {
            setLoadingProgress(count);
          }
        });
        if (isMounted) {
          setVideos(data);
          setCachedVideos(data); // 儲存到快取
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch videos');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setLoadingProgress(0);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [channelId]);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);

    try {
      // 清除快取並重新獲取
      localStorage.removeItem(CACHE_KEY);
      const data = await fetchAllChannelVideos(channelId, setLoadingProgress);
      setVideos(data);
      setCachedVideos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch videos');
    } finally {
      setIsLoading(false);
      setLoadingProgress(0);
    }
  };

  const sortedVideos = useMemo(() => {
    const sorted = [...videos].sort((a, b) => {
      let comparison = 0;

      switch (sortOption) {
        case 'date':
          comparison = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
          break;
        case 'views':
          comparison = b.statistics.viewCount - a.statistics.viewCount;
          break;
        case 'likes':
          comparison = b.statistics.likeCount - a.statistics.likeCount;
          break;
        case 'comments':
          comparison = b.statistics.commentCount - a.statistics.commentCount;
          break;
      }

      return sortDirection === 'asc' ? -comparison : comparison;
    });

    return sorted;
  }, [videos, sortOption, sortDirection]);

  return {
    videos: sortedVideos,
    isLoading,
    error,
    sortOption,
    sortDirection,
    setSortOption,
    setSortDirection,
    refetch,
    loadingProgress,
  };
}
