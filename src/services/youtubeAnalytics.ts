import type { AnalyticsDataPoint, AnalyticsData } from '@/types/youtube';
import { getValidAccessToken } from './auth';

const ANALYTICS_BASE_URL = 'https://youtubeanalytics.googleapis.com/v2';

interface AnalyticsResponse {
  columnHeaders: Array<{ name: string; columnType: string; dataType: string }>;
  rows: Array<Array<string | number>>;
}

function formatDateForApi(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDateRange(days: number): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return {
    startDate: formatDateForApi(startDate),
    endDate: formatDateForApi(endDate),
  };
}

export async function fetchAnalyticsData(days: number = 30): Promise<AnalyticsData> {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('Not authenticated. Please login to view analytics.');
  }

  const { startDate, endDate } = getDateRange(days);

  const params = new URLSearchParams({
    ids: 'channel==MINE',
    startDate,
    endDate,
    metrics: 'views,subscribersGained,subscribersLost,estimatedMinutesWatched,likes,comments',
    dimensions: 'day',
    sort: 'day',
  });

  const response = await fetch(`${ANALYTICS_BASE_URL}/reports?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Failed to fetch analytics data');
  }

  const data: AnalyticsResponse = await response.json();

  // Parse the response into our data structure
  let cumulativeSubscribers = 0;
  const rows: AnalyticsDataPoint[] = (data.rows || []).map((row) => {
    const subscribersGained = Number(row[1]) || 0;
    const subscribersLost = Number(row[2]) || 0;
    cumulativeSubscribers += subscribersGained - subscribersLost;

    return {
      date: String(row[0]),
      views: Number(row[1]) || 0,
      subscribers: cumulativeSubscribers,
      estimatedMinutesWatched: Number(row[3]) || 0,
      likes: Number(row[4]) || 0,
      comments: Number(row[5]) || 0,
    };
  });

  // Calculate totals
  const totals = (data.rows || []).reduce(
    (acc, row) => ({
      views: acc.views + (Number(row[1]) || 0),
      subscribersGained: acc.subscribersGained + (Number(row[2]) || 0),
      subscribersLost: acc.subscribersLost + (Number(row[3]) || 0),
      estimatedMinutesWatched: acc.estimatedMinutesWatched + (Number(row[4]) || 0),
    }),
    { views: 0, subscribersGained: 0, subscribersLost: 0, estimatedMinutesWatched: 0 }
  );

  return { rows, totals };
}

export async function fetchDailyViews(days: number = 30): Promise<Array<{ date: string; views: number }>> {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const { startDate, endDate } = getDateRange(days);

  const params = new URLSearchParams({
    ids: 'channel==MINE',
    startDate,
    endDate,
    metrics: 'views',
    dimensions: 'day',
    sort: 'day',
  });

  const response = await fetch(`${ANALYTICS_BASE_URL}/reports?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch daily views');
  }

  const data: AnalyticsResponse = await response.json();

  return (data.rows || []).map((row) => ({
    date: String(row[0]),
    views: Number(row[1]) || 0,
  }));
}

export interface VideoSubscriberStats {
  videoId: string;
  subscribersGained: number;
  subscribersLost: number;
  netSubscribers: number;
}

// Fetch subscriber stats for all videos (grouped by video dimension)
export async function fetchVideoSubscriberStats(
  days: number = 365 // Default to 1 year to capture lifetime stats
): Promise<Map<string, VideoSubscriberStats>> {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const { startDate, endDate } = getDateRange(days);
  const statsMap = new Map<string, VideoSubscriberStats>();

  // YouTube Analytics API allows filtering by video, but we need to query per video
  // or use dimension=video to get all at once
  const params = new URLSearchParams({
    ids: 'channel==MINE',
    startDate,
    endDate,
    metrics: 'subscribersGained,subscribersLost',
    dimensions: 'video',
    sort: '-subscribersGained',
    maxResults: '50',
  });

  const response = await fetch(`${ANALYTICS_BASE_URL}/reports?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('Failed to fetch video subscriber stats:', error);
    return statsMap;
  }

  const data: AnalyticsResponse = await response.json();

  // Parse response - rows are [videoId, subscribersGained, subscribersLost]
  (data.rows || []).forEach((row) => {
    const videoId = String(row[0]);
    const gained = Number(row[1]) || 0;
    const lost = Number(row[2]) || 0;

    statsMap.set(videoId, {
      videoId,
      subscribersGained: gained,
      subscribersLost: lost,
      netSubscribers: gained - lost,
    });
  });

  return statsMap;
}

export async function fetchSubscriberChange(days: number = 30): Promise<Array<{ date: string; net: number; gained: number; lost: number }>> {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const { startDate, endDate } = getDateRange(days);

  const params = new URLSearchParams({
    ids: 'channel==MINE',
    startDate,
    endDate,
    metrics: 'subscribersGained,subscribersLost',
    dimensions: 'day',
    sort: 'day',
  });

  const response = await fetch(`${ANALYTICS_BASE_URL}/reports?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch subscriber data');
  }

  const data: AnalyticsResponse = await response.json();

  return (data.rows || []).map((row) => ({
    date: String(row[0]),
    gained: Number(row[1]) || 0,
    lost: Number(row[2]) || 0,
    net: (Number(row[1]) || 0) - (Number(row[2]) || 0),
  }));
}
