import type { ChannelInfo, Video } from '@/types/youtube';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

interface YouTubeChannelResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      customUrl: string;
      publishedAt: string;
      thumbnails: {
        default: { url: string; width: number; height: number };
        medium: { url: string; width: number; height: number };
        high: { url: string; width: number; height: number };
      };
    };
    statistics: {
      subscriberCount: string;
      viewCount: string;
      videoCount: string;
      hiddenSubscriberCount: boolean;
    };
  }>;
}

interface YouTubeSearchResponse {
  items: Array<{
    id: { videoId: string };
  }>;
  nextPageToken?: string;
}

interface YouTubeVideoResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      publishedAt: string;
      thumbnails: {
        default: { url: string; width: number; height: number };
        medium: { url: string; width: number; height: number };
        high: { url: string; width: number; height: number };
        maxres?: { url: string; width: number; height: number };
      };
    };
    statistics: {
      viewCount: string;
      likeCount: string;
      commentCount: string;
    };
    contentDetails: {
      duration: string;
    };
  }>;
}

export async function fetchChannelInfo(channelId: string = CHANNEL_ID): Promise<ChannelInfo> {
  const params = new URLSearchParams({
    part: 'snippet,statistics',
    id: channelId,
    key: API_KEY,
  });

  const response = await fetch(`${BASE_URL}/channels?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch channel info');
  }

  const data: YouTubeChannelResponse = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error('Channel not found');
  }

  const channel = data.items[0];

  return {
    id: channel.id,
    title: channel.snippet.title,
    description: channel.snippet.description,
    customUrl: channel.snippet.customUrl,
    publishedAt: channel.snippet.publishedAt,
    thumbnails: channel.snippet.thumbnails,
    statistics: {
      subscriberCount: parseInt(channel.statistics.subscriberCount, 10),
      viewCount: parseInt(channel.statistics.viewCount, 10),
      videoCount: parseInt(channel.statistics.videoCount, 10),
      hiddenSubscriberCount: channel.statistics.hiddenSubscriberCount,
    },
  };
}

export async function fetchChannelVideos(
  channelId: string = CHANNEL_ID,
  maxResults: number = 10
): Promise<Video[]> {
  // First, get video IDs from the channel
  const searchParams = new URLSearchParams({
    part: 'id',
    channelId: channelId,
    maxResults: maxResults.toString(),
    order: 'date',
    type: 'video',
    key: API_KEY,
  });

  const searchResponse = await fetch(`${BASE_URL}/search?${searchParams}`);

  if (!searchResponse.ok) {
    throw new Error('Failed to fetch channel videos');
  }

  const searchData: YouTubeSearchResponse = await searchResponse.json();

  if (!searchData.items || searchData.items.length === 0) {
    return [];
  }

  const videoIds = searchData.items.map((item) => item.id.videoId).join(',');

  // Then, get detailed video info
  const videosParams = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    id: videoIds,
    key: API_KEY,
  });

  const videosResponse = await fetch(`${BASE_URL}/videos?${videosParams}`);

  if (!videosResponse.ok) {
    throw new Error('Failed to fetch video details');
  }

  const videosData: YouTubeVideoResponse = await videosResponse.json();

  return videosData.items.map((item) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    publishedAt: item.snippet.publishedAt,
    thumbnails: item.snippet.thumbnails,
    statistics: {
      viewCount: parseInt(item.statistics.viewCount || '0', 10),
      likeCount: parseInt(item.statistics.likeCount || '0', 10),
      commentCount: parseInt(item.statistics.commentCount || '0', 10),
    },
    duration: item.contentDetails.duration,
  }));
}

export function parseDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 週前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 個月前`;
  return `${Math.floor(diffDays / 365)} 年前`;
}
