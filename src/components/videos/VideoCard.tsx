import { motion } from 'framer-motion';
import type { Video } from '@/types/youtube';
import { parseDuration, formatRelativeTime } from '@/services/youtube';
import { Card } from '@/components/ui/Card';

interface VideoCardProps {
  video: Video;
  index: number;
  subscribersGained?: number;
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

function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  );
}

export function VideoCard({ video, index, subscribersGained }: VideoCardProps) {
  const thumbnailUrl = video.thumbnails.medium?.url || video.thumbnails.default.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Card
        className="overflow-hidden"
        onClick={() => window.open(`https://youtube.com/watch?v=${video.id}`, '_blank')}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Thumbnail */}
          <div className="relative w-full sm:w-48 aspect-video sm:aspect-auto sm:h-28 flex-shrink-0">
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-xs font-medium text-white">
              {parseDuration(video.duration)}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
            <div>
              <h3 className="text-foreground font-medium line-clamp-2 leading-tight mb-2">
                {video.title}
              </h3>
              <p className="text-sm text-foreground-muted">
                {formatRelativeTime(video.publishedAt)}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3 text-sm text-foreground-muted">
              <div className="flex items-center gap-1.5">
                <EyeIcon />
                <span>{formatNumber(video.statistics.viewCount)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HeartIcon />
                <span>{formatNumber(video.statistics.likeCount)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ChatIcon />
                <span>{formatNumber(video.statistics.commentCount)}</span>
              </div>
              {subscribersGained !== undefined && subscribersGained > 0 && (
                <div className="flex items-center gap-1.5 text-success">
                  <UserPlusIcon />
                  <span>+{formatNumber(subscribersGained)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
