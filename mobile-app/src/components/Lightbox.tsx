import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Share2, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface Photo {
  id: string | number;
  src: string;
  timestamp?: string;
}

interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onShare?: (photo: Photo) => void;
}

export default function Lightbox({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onShare
}: LightboxProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch(e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex]);

  const goToPrevious = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
      resetZoom();
    }
  };

  const goToNext = () => {
    if (activeIndex < photos.length - 1) {
      setActiveIndex(activeIndex + 1);
      resetZoom();
    }
  };

  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.5, 3));
  };

  const handleZoomOut = () => {
    if (zoom <= 1) {
      resetZoom();
    } else {
      setZoom(Math.max(zoom - 0.5, 1));
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const link = document.createElement('a');
      link.href = photos[activeIndex].src;
      link.download = `photo_${photos[activeIndex].id}.jpg`;
      link.click();
      
      // Show success feedback
      await new Promise(resolve => setTimeout(resolve, 800));
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[activeIndex];

  return (
    <div className="fixed inset-0 z-[60] bg-black animate-fadeIn">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4 safe-top">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <p className="text-sm">{activeIndex + 1} / {photos.length}</p>
            {currentPhoto.timestamp && (
              <p className="text-xs opacity-70">{currentPhoto.timestamp}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <button
              onClick={handleZoomOut}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors min-tap"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors min-tap"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors min-tap disabled:opacity-50 relative"
              aria-label="Download"
            >
              {isDownloading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </button>

            {/* Share */}
            {onShare && (
              <button
                onClick={() => onShare(currentPhoto)}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors min-tap"
                aria-label="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors min-tap"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Image viewer */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={currentPhoto.src}
          alt={`Photo ${currentPhoto.id}`}
          className="max-w-full max-h-full object-contain transition-transform duration-300"
          style={{
            transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
          }}
          draggable={false}
        />
      </div>

      {/* Navigation buttons */}
      {activeIndex > 0 && (
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors min-tap"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {activeIndex < photos.length - 1 && (
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors min-tap"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent safe-bottom">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => {
                  setActiveIndex(index);
                  resetZoom();
                }}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === activeIndex
                    ? 'border-white scale-110'
                    : 'border-white/30 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={photo.src}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
