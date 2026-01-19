import { useState } from 'react';
import type { Video, SortOption, SortDirection } from '@/types/youtube';
import type { VideoSubscriberStats } from '@/services/youtubeAnalytics';
import { VideoCard } from './VideoCard';
import { VideoCardGrid } from './VideoCardGrid';
import { Card } from '@/components/ui/Card';

type ViewMode = 'row' | 'grid';

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

function GridIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  if (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-error">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          最新影片 {videos.length > 0 && `(${videos.length})`}
        </h2>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-bg-elevated border border-border">
            <button
              onClick={() => setViewMode('row')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'row'
                  ? 'bg-accent text-white'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
              title="列表視圖"
            >
              <ListIcon />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-accent text-white'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
              title="網格視圖"
            >
              <GridIcon />
            </button>
          </div>

          {/* Sort controls */}
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
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-4'
        }>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={viewMode === 'grid' ? 'aspect-[9/12] rounded-xl bg-bg-card animate-pulse' : 'h-28 rounded-xl bg-bg-card animate-pulse'}
            />
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video, index) => (
            <VideoCardGrid
              key={video.id}
              video={video}
              index={index}
              subscribersGained={subscriberStats?.get(video.id)?.subscribersGained}
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
