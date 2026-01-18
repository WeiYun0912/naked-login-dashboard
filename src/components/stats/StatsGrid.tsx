import type { ChannelInfo } from '@/types/youtube';
import { StatCard } from './StatCard';

interface StatsGridProps {
  channel: ChannelInfo | null;
  isLoading: boolean;
}

function UsersIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function formatChannelAge(publishedAt: string): string {
  const date = new Date(publishedAt);
  const now = new Date();
  const years = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365));
  const months = Math.floor(((now.getTime() - date.getTime()) % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));

  if (years > 0) {
    return `${years} 年 ${months} 個月`;
  }
  return `${months} 個月`;
}

export function StatsGrid({ channel, isLoading }: StatsGridProps) {
  if (isLoading || !channel) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-bg-card animate-pulse"
          />
        ))}
      </div>
    );
  }

  const channelAge = formatChannelAge(channel.publishedAt);
  const ageInYears = parseInt(channelAge) || 1;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="訂閱人數"
        value={channel.statistics.subscriberCount}
        icon={<UsersIcon />}
        delay={0}
      />
      <StatCard
        title="總觀看數"
        value={channel.statistics.viewCount}
        icon={<EyeIcon />}
        delay={0.1}
      />
      <StatCard
        title="影片數量"
        value={channel.statistics.videoCount}
        icon={<VideoIcon />}
        delay={0.2}
      />
      <StatCard
        title="頻道年齡"
        value={ageInYears}
        icon={<CalendarIcon />}
        format={() => channelAge}
        delay={0.3}
      />
    </div>
  );
}
