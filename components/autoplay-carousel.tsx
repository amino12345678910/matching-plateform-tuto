'use client';

import * as React from 'react';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import {cloudinaryUrl} from '@/lib/cloudinary';
import {cn} from '@/lib/utils';
import {Skeleton} from './loading-primitives';
import {ChevronLeft, ChevronRight} from 'lucide-react';

interface CarouselProps {
  images: string[];
  onLoad?: () => void;
  className?: string;
  style?: React.CSSProperties;
  onSelect?: (index: number) => void;
  selectedIndex?: number;
}

function AutomatedCarousel({
  images,
  onLoad,
  className,
  style,
  onSelect,
  selectedIndex = 0,
}: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {loop: true, startIndex: selectedIndex, skipSnaps: true},
    [Autoplay({delay: 4000, stopOnInteraction: true})]
  );

  const [currentIndex, setCurrentIndex] = React.useState(selectedIndex);

  React.useEffect(() => {
    if (emblaApi) {
      emblaApi.on('select', () => {
        const newIndex = emblaApi.selectedScrollSnap();
        setCurrentIndex(newIndex);
        onSelect?.(newIndex);
      });
    }
  }, [emblaApi, onSelect]);

  React.useEffect(() => {
    if (emblaApi && selectedIndex !== currentIndex) {
      emblaApi.scrollTo(selectedIndex);
    }
  }, [emblaApi, selectedIndex, currentIndex]);

  const handlePrevious = () => {
    if (emblaApi) {
      emblaApi.scrollPrev(false);
    }
  };

  const handleNext = () => {
    if (emblaApi) {
      emblaApi.scrollNext(false);
    }
  };

  const handleThumbnailClick = (index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
    onSelect?.(index);
  };

  return (
    <div className={cn('relative w-full', className)} style={style}>
      <div ref={emblaRef} className="w-full overflow-hidden rounded-xl bg-muted/30">
        <div className="flex">
          {images.map((image, index) => (
            <div key={index} className="relative flex-shrink-0 flex-grow-0 w-full aspect-video">
              <Image
                onLoad={onLoad}
                src={cloudinaryUrl(image, 'q_auto,f_auto,w_1200')}
                alt={`Service preview ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border shadow-md flex items-center justify-center hover:bg-background transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border shadow-md flex items-center justify-center hover:bg-background transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                'h-2 w-2 rounded-full transition-all',
                index === currentIndex ? 'bg-primary w-6' : 'bg-primary/30 hover:bg-primary/50'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ServiceCarousel({service}: {service: {images: string[]}}) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [thumbnailLoaded, setThumbnailLoaded] = React.useState<Record<number, boolean>>({});

  const handleThumbnailLoad = (index: number) => {
    setThumbnailLoaded(prev => ({...prev, [index]: true}));
  };

  const displayedImages = service.images.slice(0, 6);

  return (
    <div className="mb-10 space-y-4">
      {/* Main Carousel */}
      <div className="relative w-full overflow-hidden rounded-xl">
        {!imageLoaded && <Skeleton className="absolute inset-0 z-0" />}
        <AutomatedCarousel
          images={service.images}
          onLoad={() => setImageLoaded(true)}
          className="aspect-video"
          style={{opacity: imageLoaded ? 1 : 0}}
          onSelect={setSelectedIndex}
          selectedIndex={selectedIndex}
        />
      </div>

      {/* Thumbnail Navigation */}
      {service.images.length > 1 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Slide {selectedIndex + 1} of {service.images.length}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Current
              </span>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {displayedImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  'group relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  selectedIndex === index
                    ? 'border-primary ring-2 ring-primary ring-offset-1 scale-[1.02]'
                    : 'border-muted hover:border-primary hover:scale-[1.01]'
                )}
                aria-label={`View image ${index + 1}`}
                aria-current={selectedIndex === index ? 'true' : 'false'}
              >
                {!thumbnailLoaded[index] && <Skeleton className="absolute inset-0" />}
                <Image
                  src={cloudinaryUrl(image, 'q_auto,f_auto,w_200,h_150,c_fill')}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className={cn(
                    'object-cover transition-opacity duration-300',
                    thumbnailLoaded[index] ? 'opacity-100' : 'opacity-0'
                  )}
                  onLoad={() => handleThumbnailLoad(index)}
                  sizes="80px"
                  loading="lazy"
                />

                {selectedIndex === index && (
                  <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                )}

                <div className="absolute top-1 left-1">
                  <span
                    className={cn(
                      'h-5 w-5 text-xs flex items-center justify-center rounded-full',
                      selectedIndex === index
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'bg-background/80 text-foreground font-normal'
                    )}
                  >
                    {index + 1}
                  </span>
                </div>
              </button>
            ))}

            {service.images.length > displayedImages.length && (
              <div className="flex-shrink-0 w-24 h-16 rounded-lg border border-dashed border-muted flex items-center justify-center">
                <span className="text-xs text-muted-foreground">
                  +{service.images.length - displayedImages.length} more
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="lg:hidden flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="h-6 w-6 rounded-full border flex items-center justify-center">←</div>
          <span>Swipe to navigate</span>
        </div>
      </div>
    </div>
  );
}
