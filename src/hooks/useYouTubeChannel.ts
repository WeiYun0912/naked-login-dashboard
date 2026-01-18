import { useState, useEffect } from 'react';
import type { ChannelInfo } from '@/types/youtube';
import { fetchChannelInfo } from '@/services/youtube';

interface UseYouTubeChannelReturn {
  channel: ChannelInfo | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useYouTubeChannel(channelId?: string): UseYouTubeChannelReturn {
  const [channel, setChannel] = useState<ChannelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchChannelInfo(channelId);
        if (isMounted) {
          setChannel(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch channel data');
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
  }, [channelId]);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchChannelInfo(channelId);
      setChannel(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch channel data');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    channel,
    isLoading,
    error,
    refetch,
  };
}
