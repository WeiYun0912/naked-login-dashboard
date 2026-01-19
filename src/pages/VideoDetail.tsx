import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Background } from '@/components/layout/Background';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { ViewsChart } from '@/components/charts/ViewsChart';
import { TrafficSourcesChart } from '@/components/analytics/TrafficSourcesChart';
import { DemographicsChart } from '@/components/analytics/DemographicsChart';
import { GeographyChart } from '@/components/analytics/GeographyChart';
import { useAuth } from '@/hooks/useAuth';
import { useYouTubeVideos } from '@/hooks/useYouTubeVideos';
import { useVideoAnalytics } from '@/hooks/useVideoAnalytics';

function BackIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function parseDuration(duration: string): number {
  // Parse ISO 8601 duration format (e.g., PT15M33S)
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  return hours * 3600 + minutes * 60 + seconds;
}

export function VideoDetail() {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Date range state (default to last 30 days)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });

  // Get video info from the videos list
  const { videos } = useYouTubeVideos();
  const video = videos.find((v) => v.id === videoId);

  // Get video analytics
  const { analytics, isLoading, error } = useVideoAnalytics(
    videoId || '',
    dateRange,
    isAuthenticated
  );

  if (!videoId) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <Background />
        <Container>
          <Card className="p-6 text-center">
            <p className="text-error">無效的影片 ID</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              返回首頁
            </Button>
          </Card>
        </Container>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <Background />
        <Container>
          <Card className="p-6 text-center">
            <p className="text-foreground-muted mb-4">請先登入以查看影片詳細分析</p>
            <Button onClick={() => navigate('/')}>返回首頁</Button>
          </Card>
        </Container>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <Background />
        <Container>
          <Card className="p-6 text-center">
            <p className="text-error">找不到影片</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              返回首頁
            </Button>
          </Card>
        </Container>
      </div>
    );
  }

  const videoDurationSeconds = parseDuration(video.duration);
  const averageViewPercentage = analytics?.totalStats.averageViewPercentage || 0;
  const likeRate = analytics?.totalStats.views
    ? ((analytics.totalStats.likes / analytics.totalStats.views) * 100).toFixed(2)
    : '0';

  return (
    <div className="min-h-screen relative">
      <Background />

      <Container className="py-8 space-y-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            icon={<BackIcon />}
          >
            返回 Dashboard
          </Button>
        </motion.div>

        {/* Video Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Thumbnail */}
              <div className="flex-shrink-0">
                <img
                  src={video.thumbnails.maxres?.url || video.thumbnails.high.url}
                  alt={video.title}
                  className="w-full lg:w-96 rounded-lg"
                />
              </div>

              {/* Video Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground mb-2">{video.title}</h1>
                <p className="text-sm text-foreground-muted mb-4">
                  發布時間：{new Date(video.publishedAt).toLocaleDateString('zh-TW', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-foreground-muted">觀看次數</p>
                    <p className="text-xl font-semibold text-foreground">
                      {formatNumber(video.statistics.viewCount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-muted">按讚數</p>
                    <p className="text-xl font-semibold text-foreground">
                      {formatNumber(video.statistics.likeCount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-muted">留言數</p>
                    <p className="text-xl font-semibold text-foreground">
                      {formatNumber(video.statistics.commentCount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-muted">影片長度</p>
                    <p className="text-xl font-semibold text-foreground">
                      {formatDuration(videoDurationSeconds)}
                    </p>
                  </div>
                </div>

                {/* Watch on YouTube Button */}
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => window.open(`https://youtube.com/watch?v=${video.id}`, '_blank')}
                >
                  在 YouTube 觀看
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Date Range Picker */}
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </motion.section>

        {/* Error State */}
        {error && (
          <Card className="p-6">
            <p className="text-error">{error}</p>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="p-6">
            <div className="h-32 flex items-center justify-center">
              <p className="text-foreground-muted">載入分析數據中...</p>
            </div>
          </Card>
        )}

        {/* Analytics Data */}
        {analytics && !isLoading && (
          <>
            {/* Key Metrics */}
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">關鍵指標</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="p-4">
                  <p className="text-xs text-foreground-muted mb-1">觀看次數</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatNumber(analytics.totalStats.views)}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-foreground-muted mb-1">平均觀看時長</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatDuration(Math.round(analytics.totalStats.averageViewDuration))}
                  </p>
                  <p className="text-xs text-foreground-muted mt-1">
                    {averageViewPercentage.toFixed(1)}% 完整度
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-foreground-muted mb-1">按讚數</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatNumber(analytics.totalStats.likes)}
                  </p>
                  <p className="text-xs text-foreground-muted mt-1">{likeRate}% 按讚率</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-foreground-muted mb-1">留言數</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatNumber(analytics.totalStats.comments)}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-foreground-muted mb-1">分享數</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatNumber(analytics.totalStats.shares)}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-foreground-muted mb-1">訂閱貢獻</p>
                  <p className="text-2xl font-bold text-accent">
                    +{formatNumber(analytics.totalStats.subscribersGained)}
                  </p>
                  {analytics.totalStats.subscribersLost > 0 && (
                    <p className="text-xs text-error mt-1">
                      -{formatNumber(analytics.totalStats.subscribersLost)}
                    </p>
                  )}
                </Card>
              </div>
            </section>

            {/* Views Trend */}
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">觀看趨勢</h2>
              <ViewsChart data={analytics.dailyViews} isLoading={false} error={null} />
            </section>

            {/* Traffic Sources */}
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">流量來源</h2>
              <TrafficSourcesChart
                data={analytics.trafficSources}
                isLoading={false}
                error={null}
              />
            </section>

            {/* Audience Insights */}
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">觀眾洞察</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DemographicsChart
                  data={analytics.demographics}
                  isLoading={false}
                  error={null}
                />
                <GeographyChart data={analytics.geography} isLoading={false} error={null} />
              </div>
            </section>
          </>
        )}

        {/* Footer */}
        <footer className="text-center py-8 border-t border-border">
          <p className="text-sm text-foreground-muted">YouTube Dashboard - 低階思維</p>
        </footer>
      </Container>
    </div>
  );
}
