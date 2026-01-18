import type { Video, SortOption, SortDirection } from '@/types/youtube';
import type { VideoSubscriberStats } from '@/services/youtubeAnalytics';
import { VideoCard } from './VideoCard';
import { Card } from '@/components/ui/Card';

interface VideoListProps {
  videos: Video[];
  isLoading: boolean;
  error: string | null;
  sortOption: SortOption;
  sortDirection: SortDirection;
  onSortOptionChange: (option: SortOption) => void;
  onSortDirectionChange: (direction: SortDirection) => void;
  subscriberStats?: Map<string, VideoSubscriberStats>;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'date', label: '發布日期' },
  { value: 'views', label: '觀看數' },
  { value: 'likes', label: '按讚數' },
  { value: 'comments', label: '留言數' },
];

function ChevronDownIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  );
}

export function VideoList({
  videos,
  isLoading,
  error,
  sortOption,
  sortDirection,
  onSortOptionChange,
  onSortDirectionChange,
  subscriberStats,
}: VideoListProps) {
  if (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-error">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with sort controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">最新影片</h2>

        <div className="flex items-center gap-2">
          <select
            value={sortOption}
            onChange={(e) => onSortOptionChange(e.target.value as SortOption)}
            className="px-3 py-1.5 rounded-lg bg-bg-elevated border border-border text-sm text-foreground focus:outline-none focus:border-accent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}
            className="p-2 rounded-lg bg-bg-elevated border border-border text-foreground-muted hover:text-foreground hover:border-border-hover transition-colors"
            title={sortDirection === 'asc' ? '升序' : '降序'}
          >
            {sortDirection === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </button>
        </div>
      </div>

      {/* Video list */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-bg-card animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((video, index) => (
            <VideoCard
              key={video.id}
              video={video}
              index={index}
              subscribersGained={subscriberStats?.get(video.id)?.subscribersGained}
            />
          ))}
        </div>
      )}

      {!isLoading && videos.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-foreground-muted">尚無影片</p>
        </Card>
      )}
    </div>
  );
}
