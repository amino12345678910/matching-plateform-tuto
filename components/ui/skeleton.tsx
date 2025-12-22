import {cn} from '@/lib/utils';

function Skeleton({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent-foreground/40 animate-pulse rounded-md', className)}
      {...props}
    />
  );
}
function SkeletonLine({width = 'w-full', height = 'h-4'}: {width?: string; height?: string}) {
  return <Skeleton className={`${width} ${height}`} />;
}
function SkeletonAvatar({size = 24}: {size?: number}) {
  return <Skeleton className="rounded-full" style={{width: size, height: size}} />;
}
function SkeletonImage({height}: {height: number}) {
  return <Skeleton style={{height}} className="w-full" />;
}

export {Skeleton, SkeletonAvatar, SkeletonImage, SkeletonLine};
