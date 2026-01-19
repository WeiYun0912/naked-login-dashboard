import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Video } from '@/types/youtube';
import { parseDuration, formatRelativeTime } from '@/services/youtube';
import { Card } from '@/components/ui/Card';

interface VideoCardGridProps {
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

function YouTubeIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function VideoCardGrid({ video, index, subscribersGained }: VideoCardGridProps) {
  const thumbnailUrl = video.thumbnails.medium?.url || video.thumbnails.default.url;
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/video/${video.id}`);
  };

  const handleYouTubeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://youtube.com/watch?v=${video.id}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Card className="overflow-hidden cursor-pointer" onClick={handleCardClick}>
        <div className="flex flex-col">
          {/* Thumbnail */}
          <div className="relative w-full aspect-video">
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-xs font-medium text-white">
              {parseDuration(video.duration)}
            </span>
            {/* YouTube Button */}
            <button
              onClick={handleYouTubeClick}
              className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-error/80 rounded-full transition-colors duration-200"
              title="在 YouTube 觀看"
            >
              <YouTubeIcon />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-foreground font-medium line-clamp-2 leading-tight mb-2 min-h-[2.5rem]">
              {video.title}
            </h3>
            <p className="text-sm text-foreground-muted mb-3">
              {formatRelativeTime(video.publishedAt)}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-foreground-muted">
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
