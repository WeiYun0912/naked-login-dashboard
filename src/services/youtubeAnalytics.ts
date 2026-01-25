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

// Support both date objects and days parameter for backward compatibility
function getDateRange(
  startDate?: Date,
  endDate?: Date,
  days?: number
): { startDate: string; endDate: string } {
  // If dates are provided, use them
  if (startDate && endDate) {
    return {
      startDate: formatDateForApi(startDate),
      endDate: formatDateForApi(endDate),
    };
  }

  // Otherwise, calculate from days (default to 30)
  const daysToUse = days || 30;
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - daysToUse);

  return {
    startDate: formatDateForApi(start),
    endDate: formatDateForApi(end),
  };
}

export async function fetchAnalyticsData(
  startDate?: Date,
  endDate?: Date,
  days: number = 30
): Promise<AnalyticsData> {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('Not authenticated. Please login to view analytics.');
  }

  const dateRange = getDateRange(startDate, endDate, days);
  const startDateStr = dateRange.startDate;
  const endDateStr = dateRange.endDate;

  const params = new URLSearchParams({
    ids: 'channel==MINE',
    startDate: startDateStr,
    endDate: endDateStr,
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

export async function fetchDailyViews(
  startDate?: Date,
  endDate?: Date,
  days: number = 30
): Promise<Array<{ date: string; views: number }>> {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const dateRange = getDateRange(startDate, endDate, days);
  const startDateStr = dateRange.startDate;
  const endDateStr = dateRange.endDate;

  const params = new URLSearchParams({
    ids: 'channel==MINE',
    startDate: startDateStr,
    endDate: endDateStr,
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
  startDate?: Date,
  endDate?: Date,
  days: number = 365 // Default to 1 year to capture lifetime stats
): Promise<Map<string, VideoSubscriberStats>> {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const dateRange = getDateRange(startDate, endDate, days);
  const startDateStr = dateRange.startDate;
  const endDateStr = dateRange.endDate;
  const statsMap = new Map<string, VideoSubscriberStats>();

  // YouTube Analytics API allows filtering by video, but we need to query per video
  // or use dimension=video to get all at once
  const params = new URLSearchParams({
    ids: 'channel==MINE',
    startDate: startDateStr,
    endDate: endDateStr,
    metrics: 'subscribersGained,subscribersLost',
    dimensions: 'video',
    sort: '-subscribersGained',
    maxResults: '150',
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

export async function fetchSubscriberChange(
  startDate?: Date,
  endDate?: Date,
  days: number = 30
): Promise<Array<{ date: string; net: number; gained: number; lost: number }>> {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const dateRange = getDateRange(startDate, endDate, days);
  const startDateStr = dateRange.startDate;
  const endDateStr = dateRange.endDate;

  const params = new URLSearchParams({
    ids: 'channel==MINE',
    startDate: startDateStr,
    endDate: endDateStr,
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

// Traffic Source Analysis
export interface TrafficSource {
  sourceType: string;
  sourceTypeName: string;
  views: number;
  estimatedMinutesWatched: number;
  percentage: number;
}

const TRAFFIC_SOURCE_NAMES: Record<string, string> = {
  YT_SEARCH: 'YouTube 搜尋',
  BROWSE_FEATURES: 'YouTube 首頁/推薦',
  SUGGESTED_VIDEO: '推薦影片',
  EXT_URL: '外部連結',
  NOTIFICATION: '通知',
  SUBSCRIBER: '訂閱者動態',
  YT_CHANNEL: '頻道頁面',
  YT_OTHER_PAGE: '其他 YouTube 頁面',
  NO_LINK_OTHER: '直接流量',
  ANNOTATION: '註解',
  CAMPAIGN_CARD: '宣傳卡片',
  END_SCREEN: '結束畫面',
  HASHTAGS: '主題標籤',
  PLAYLIST: '播放清單',
  PRODUCT_PAGE: '商品頁面',
  SHORTS: 'YouTube Shorts',
  SOUND_PAGE: '音訊頁面',
};

export async function fetchTrafficSources(
  startDate: Date,
  endDate: Date
): Promise<TrafficSource[]> {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const dateRange = getDateRange(startDate, endDate);
  const startDateStr = dateRange.startDate;
  const endDateStr = dateRange.endDate;

  const params = new URLSearchParams({
    ids: 'channel==MINE',
    startDate: startDateStr,
    endDate: endDateStr,
    metrics: 'views,estimatedMinutesWatched',
    dimensions: 'insightTrafficSourceType',
    sort: '-views',
  });

  const response = await fetch(`${ANALYTICS_BASE_URL}/reports?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch traffic sources');
  }

  const data: AnalyticsResponse = await response.json();

  // Calculate total views for percentage
  const totalViews = (data.rows || []).reduce((sum, row) => sum + (Number(row[1]) || 0), 0);

  return (data.rows || []).map((row) => {
    const sourceType = String(row[0]);
    const views = Number(row[1]) || 0;
    const estimatedMinutesWatched = Number(row[2]) || 0;

    return {
      sourceType,
      sourceTypeName: TRAFFIC_SOURCE_NAMES[sourceType] || sourceType,
      views,
      estimatedMinutesWatched,
      percentage: totalViews > 0 ? (views / totalViews) * 100 : 0,
    };
  });
}

// Demographics Analysis
export interface DemographicData {
  ageGroup: string;
  gender: string;
  viewsPercentage: number;
}

const AGE_GROUP_NAMES: Record<string, string> = {
  'age13-17': '13-17歲',
  'age18-24': '18-24歲',
  'age25-34': '25-34歲',
  'age35-44': '35-44歲',
  'age45-54': '45-54歲',
  'age55-64': '55-64歲',
  'age65-': '65歲以上',
};

const GENDER_NAMES: Record<string, string> = {
  male: '男性',
  female: '女性',
  user_specified: '其他',
};

export async function fetchDemographics(
  startDate: Date,
  endDate: Date
): Promise<DemographicData[]> {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const dateRange = getDateRange(startDate, endDate);
  const startDateStr = dateRange.startDate;
  const endDateStr = dateRange.endDate;

  const params = new URLSearchParams({
    ids: 'channel==MINE',
    startDate: startDateStr,
    endDate: endDateStr,
    metrics: 'viewsPercentage',
    dimensions: 'ageGroup,gender',
    sort: '-viewsPercentage',
  });

  const response = await fetch(`${ANALYTICS_BASE_URL}/reports?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch demographics');
  }

  const data: AnalyticsResponse = await response.json();

  return (data.rows || []).map((row) => ({
    ageGroup: AGE_GROUP_NAMES[String(row[0])] || String(row[0]),
    gender: GENDER_NAMES[String(row[1])] || String(row[1]),
    viewsPercentage: Number(row[2]) || 0,
  }));
}

// Geography Analysis
export interface GeographyData {
  country: string;
  countryName: string;
  views: number;
  viewsPercentage: number;
}

const COUNTRY_NAMES: Record<string, string> = {
  TW: '台灣',
  US: '美國',
  JP: '日本',
  CN: '中國',
  KR: '韓國',
  GB: '英國',
  DE: '德國',
  FR: '法國',
  CA: '加拿大',
  AU: '澳洲',
  HK: '香港',
  SG: '新加坡',
  MY: '馬來西亞',
  TH: '泰國',
  VN: '越南',
  IN: '印度',
  ID: '印尼',
  PH: '菲律賓',
  ES: '西班牙',
  IT: '義大利',
  NL: '荷蘭',
  BR: '巴西',
  MX: '墨西哥',
  RU: '俄羅斯',
  PL: '波蘭',
};

export async function fetchGeography(
  startDate: Date,
  endDate: Date
): Promise<GeographyData[]> {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const dateRange = getDateRange(startDate, endDate);
  const startDateStr = dateRange.startDate;
  const endDateStr = dateRange.endDate;

  const params = new URLSearchParams({
    ids: 'channel==MINE',
    startDate: startDateStr,
    endDate: endDateStr,
    metrics: 'views',
    dimensions: 'country',
    sort: '-views',
    maxResults: '20',
  });

  const response = await fetch(`${ANALYTICS_BASE_URL}/reports?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch geography data');
  }

  const data: AnalyticsResponse = await response.json();

  // Calculate total views for percentage
  const totalViews = (data.rows || []).reduce((sum, row) => sum + (Number(row[1]) || 0), 0);

  return (data.rows || []).map((row) => {
    const countryCode = String(row[0]);
    const views = Number(row[1]) || 0;

    return {
      country: countryCode,
      countryName: COUNTRY_NAMES[countryCode] || countryCode,
      views,
      viewsPercentage: totalViews > 0 ? (views / totalViews) * 100 : 0,
    };
  });
}

// Video-specific Analytics
export interface VideoAnalytics {
  dailyViews: Array<{ date: string; views: number }>;
  trafficSources: TrafficSource[];
  totalStats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    averageViewDuration: number;
    averageViewPercentage: number;
    subscribersGained: number;
    subscribersLost: number;
  };
}

export async function fetchVideoAnalytics(
  videoId: string,
  startDate: Date,
  endDate: Date
): Promise<VideoAnalytics> {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const dateRange = getDateRange(startDate, endDate);
  const startDateStr = dateRange.startDate;
  const endDateStr = dateRange.endDate;

  const baseParams = {
    ids: 'channel==MINE',
    startDate: startDateStr,
    endDate: endDateStr,
    filters: `video==${videoId}`,
  };

  // Fetch all data in parallel
  const [
    dailyViewsData,
    trafficSourcesData,
    totalStatsData,
  ] = await Promise.all([
    // Daily views
    (async () => {
      const params = new URLSearchParams({
        ...baseParams,
        metrics: 'views',
        dimensions: 'day',
        sort: 'day',
      });

      const response = await fetch(`${ANALYTICS_BASE_URL}/reports?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error('Failed to fetch video daily views');
      const data: AnalyticsResponse = await response.json();

      return (data.rows || []).map((row) => ({
        date: String(row[0]),
        views: Number(row[1]) || 0,
      }));
    })(),

    // Traffic sources
    (async () => {
      const params = new URLSearchParams({
        ...baseParams,
        metrics: 'views,estimatedMinutesWatched',
        dimensions: 'insightTrafficSourceType',
        sort: '-views',
      });

      const response = await fetch(`${ANALYTICS_BASE_URL}/reports?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error('Failed to fetch video traffic sources');
      const data: AnalyticsResponse = await response.json();

      const totalViews = (data.rows || []).reduce((sum, row) => sum + (Number(row[1]) || 0), 0);

      return (data.rows || []).map((row) => {
        const sourceType = String(row[0]);
        const views = Number(row[1]) || 0;

        return {
          sourceType,
          sourceTypeName: TRAFFIC_SOURCE_NAMES[sourceType] || sourceType,
          views,
          estimatedMinutesWatched: Number(row[2]) || 0,
          percentage: totalViews > 0 ? (views / totalViews) * 100 : 0,
        };
      });
    })(),

    // Total stats
    (async () => {
      const params = new URLSearchParams({
        ...baseParams,
        metrics: 'views,likes,comments,shares,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost',
      });

      const response = await fetch(`${ANALYTICS_BASE_URL}/reports?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error('Failed to fetch video total stats');
      const data: AnalyticsResponse = await response.json();

      const row = data.rows?.[0] || [];
      return {
        views: Number(row[0]) || 0,
        likes: Number(row[1]) || 0,
        comments: Number(row[2]) || 0,
        shares: Number(row[3]) || 0,
        averageViewDuration: Number(row[4]) || 0,
        averageViewPercentage: Number(row[5]) || 0,
        subscribersGained: Number(row[6]) || 0,
        subscribersLost: Number(row[7]) || 0,
      };
    })(),
  ]);

  return {
    dailyViews: dailyViewsData,
    trafficSources: trafficSourcesData,
    totalStats: totalStatsData,
  };
}
