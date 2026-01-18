export interface ChannelStats {
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  hiddenSubscriberCount: boolean;
}

export interface ChannelInfo {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  publishedAt: string;
  thumbnails: {
    default: Thumbnail;
    medium: Thumbnail;
    high: Thumbnail;
  };
  statistics: ChannelStats;
}

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface VideoStats {
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnails: {
    default: Thumbnail;
    medium: Thumbnail;
    high: Thumbnail;
    maxres?: Thumbnail;
  };
  statistics: VideoStats;
  duration: string;
}

export interface AnalyticsDataPoint {
  date: string;
  views: number;
  subscribers: number;
  estimatedMinutesWatched: number;
  likes: number;
  comments: number;
}

export interface AnalyticsData {
  rows: AnalyticsDataPoint[];
  totals: {
    views: number;
    subscribersGained: number;
    subscribersLost: number;
    estimatedMinutesWatched: number;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

export type SortOption = 'date' | 'views' | 'likes' | 'comments';
export type SortDirection = 'asc' | 'desc';
