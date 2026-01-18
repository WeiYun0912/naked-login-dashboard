import { useState, useEffect, useMemo } from 'react';
import type { Video, SortOption, SortDirection } from '@/types/youtube';
import { fetchChannelVideos } from '@/services/youtube';

interface UseYouTubeVideosReturn {
  videos: Video[];
  isLoading: boolean;
  error: string | null;
  sortOption: SortOption;
  sortDirection: SortDirection;
  setSortOption: (option: SortOption) => void;
  setSortDirection: (direction: SortDirection) => void;
  refetch: () => Promise<void>;
}

export function useYouTubeVideos(
  channelId?: string,
  maxResults: number = 10
): UseYouTubeVideosReturn {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchChannelVideos(channelId, maxResults);
        if (isMounted) {
          setVideos(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch videos');
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
  }, [channelId, maxResults]);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchChannelVideos(channelId, maxResults);
      setVideos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch videos');
    } finally {
      setIsLoading(false);
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
  };
}
