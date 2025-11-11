interface SkeletonCardProps {
  lines?: number;
  className?: string;
}

export default function SkeletonCard({ 
  lines = 3,
  className = '' 
}: SkeletonCardProps) {
  return (
    <div className={`bg-white dark:bg-card rounded-2xl shadow-card p-5 ${className}`}>
      {/* Title skeleton */}
      <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
      
      {/* Content lines */}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i}
            className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
            style={{ 
              width: `${100 - (i * 15)}%`,
              animationDelay: `${i * 100}ms` 
            }}
          />
        ))}
      </div>
    </div>
  );
}
