import { useState } from 'react';
import { Background } from '@/components/layout/Background';
import { Container } from '@/components/layout/Container';
import { StatsGrid } from '@/components/stats/StatsGrid';
import { VideoList } from '@/components/videos/VideoList';
import { SubscriberChart } from '@/components/charts/SubscriberChart';
import { ViewsChart } from '@/components/charts/ViewsChart';
import { TrafficSourcesChart } from '@/components/analytics/TrafficSourcesChart';
import { LoginButton } from '@/components/auth/LoginButton';
import { Card } from '@/components/ui/Card';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { useAuth } from '@/hooks/useAuth';
import { useYouTubeChannel } from '@/hooks/useYouTubeChannel';
import { useYouTubeVideos } from '@/hooks/useYouTubeVideos';
import { useYouTubeAnalytics } from '@/hooks/useYouTubeAnalytics';
import { useVideoSubscriberStats } from '@/hooks/useVideoSubscriberStats';
import { useTrafficSources } from '@/hooks/useTrafficSources';
import { motion } from 'framer-motion';

function YouTubeIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function Dashboard() {
  // Date range state (default to last 30 days)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });

  const { isAuthenticated, isLoading: authLoading, login, logout } = useAuth();
  const { channel, isLoading: channelLoading, error: channelError } = useYouTubeChannel();
  const {
    videos,
    isLoading: videosLoading,
    error: videosError,
    sortOption,
    sortDirection,
    setSortOption,
    setSortDirection,
  } = useYouTubeVideos();
  const {
    dailyViews,
    subscriberChange,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useYouTubeAnalytics(dateRange, isAuthenticated);
  const { stats: videoSubscriberStats } = useVideoSubscriberStats(dateRange, isAuthenticated);
  const {
    trafficSources,
    isLoading: trafficLoading,
    error: trafficError,
  } = useTrafficSources(dateRange, isAuthenticated);

  return (
    <div className="min-h-screen relative">
      <Background />

      <Container className="py-8 space-y-8">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3">
            <div className="text-error">
              <YouTubeIcon />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {channel?.title || 'YouTube Dashboard'}
              </h1>
              {channel?.customUrl && (
                <p className="text-sm text-foreground-muted">{channel.customUrl}</p>
              )}
            </div>
          </div>

          <LoginButton
            isAuthenticated={isAuthenticated}
            isLoading={authLoading}
            onLogin={login}
            onLogout={logout}
          />
        </motion.header>

        {/* Date Range Picker */}
        {isAuthenticated && (
          <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </motion.section>
        )}

        {/* Channel Error */}
        {channelError && (
          <Card className="p-4 border-error/50 bg-error/10">
            <p className="text-error">{channelError}</p>
            <p className="text-sm text-foreground-muted mt-2">
              請確認 .env 檔案中的 API Key 和 Channel ID 設定正確。
            </p>
          </Card>
        )}

        {/* Stats Grid */}
        <section>
          <StatsGrid channel={channel} isLoading={channelLoading} />
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Show auth prompt if not authenticated */}
          {!isAuthenticated && !authLoading ? (
            <>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">訂閱趨勢</h3>
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <p className="text-foreground-muted mb-4">
                    登入以查看訂閱趨勢分析
                  </p>
                  <LoginButton
                    isAuthenticated={false}
                    isLoading={false}
                    onLogin={login}
                    onLogout={logout}
                  />
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">觀看趨勢</h3>
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <p className="text-foreground-muted mb-4">
                    登入以查看觀看趨勢分析
                  </p>
                  <LoginButton
                    isAuthenticated={false}
                    isLoading={false}
                    onLogin={login}
                    onLogout={logout}
                  />
                </div>
              </Card>
            </>
          ) : (
            <>
              <SubscriberChart
                data={subscriberChange}
                isLoading={analyticsLoading}
                error={analyticsError}
              />
              <ViewsChart
                data={dailyViews}
                isLoading={analyticsLoading}
                error={analyticsError}
              />
            </>
          )}
        </section>

        {/* Traffic Sources Section */}
        {isAuthenticated && (
          <section>
            <TrafficSourcesChart
              data={trafficSources}
              isLoading={trafficLoading}
              error={trafficError}
            />
          </section>
        )}

        {/* Videos Section */}
        <section>
          <VideoList
            videos={videos}
            isLoading={videosLoading}
            error={videosError}
            sortOption={sortOption}
            sortDirection={sortDirection}
            onSortOptionChange={setSortOption}
            onSortDirectionChange={setSortDirection}
            subscriberStats={videoSubscriberStats}
          />
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-border">
          <p className="text-sm text-foreground-muted">
            YouTube Dashboard - 低階思維
          </p>
        </footer>
      </Container>
    </div>
  );
}
