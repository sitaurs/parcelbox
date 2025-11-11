import { useState } from 'react';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface PhotoItemProps {
  src: string;
  thumbSrc?: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'failed';
  onClick?: () => void;
  className?: string;
}

export default function PhotoItem({
  src,
  thumbSrc,
  timestamp,
  status = 'success',
  onClick,
  className = ''
}: PhotoItemProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const statusConfig = {
    success: {
      icon: CheckCircle,
      color: 'bg-ok text-white',
    },
    pending: {
      icon: Clock,
      color: 'bg-warn text-white',
    },
    failed: {
      icon: AlertCircle,
      color: 'bg-danger text-white',
    },
  };

  const StatusIcon = statusConfig[status].icon;

  return (
    <div 
      className={`relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden cursor-pointer group ${className}`}
      onClick={onClick}
    >
      {/* Loading skeleton */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 shimmer" />
      )}

      {/* Image */}
      {!imageError && (
        <img
          src={thumbSrc || src}
          alt="Package photo"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}

      {/* Error state */}
      {imageError && (
        <div className="flex items-center justify-center h-full min-h-[150px] text-gray-400">
          <AlertCircle className="w-8 h-8" />
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />

      {/* Time badge */}
      <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-lg">
        {timestamp}
      </div>

      {/* Status indicator */}
      {status !== 'success' && (
        <div className={`absolute bottom-2 right-2 w-6 h-6 ${statusConfig[status].color} rounded-full flex items-center justify-center`}>
          <StatusIcon className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
