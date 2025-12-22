'use client';

import Link from 'next/link';
import Image from 'next/image';
import {cloudinaryUrl} from '@/lib/cloudinary';
import type {ServiceCardLite} from '@/types/service-lite';
import {useState} from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Badge} from '../../../ui/badge';
import {Button} from '../../../ui/button';
import {
  IconArrowDown,
  IconEdit,
  IconCalendar,
  IconPackage,
  IconExternalLink,
} from '@tabler/icons-react';
import {updateServiceStatus} from '@/hooks/service/update-status';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';
import {Skeleton} from '../../../ui/skeleton';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';

interface ManageServiceCardProps {
  service: ServiceCardLite;
}

export function ManageServiceCardComponent({service}: ManageServiceCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const minPrice = service.packages[0]?.price || 0;

  const primaryImage =
    service.images[0]?.length > 1
      ? cloudinaryUrl(service.images[0], 'q_auto,f_auto,w_400,h_250,c_fill')
      : '/service-fallback.jpg';

  const statusConfig = {
    DRAFT: {color: 'bg-gray-100 text-gray-700', label: 'Draft'},
    ACTIVE: {color: 'bg-green-100 text-green-700', label: 'Active'},
    PAUSED: {color: 'bg-amber-100 text-amber-700', label: 'Paused'},
    REJECTED: {color: 'bg-red-100 text-red-700', label: 'Rejected'},
  };

  const status = statusConfig[service.status] || statusConfig.PAUSED;

  const updatedDate = new Date(service.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="group relative w-full overflow-hidden rounded-lg border border-border bg-card hover:border-primary/30 transition-colors duration-200">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/20">
        {!imageLoaded && <Skeleton className="absolute inset-0" />}

        <Image
          src={primaryImage}
          alt={service.title}
          fill
          className={cn(
            'object-cover transition-transform duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0',
            'group-hover:scale-105'
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          onLoad={() => setImageLoaded(true)}
        />

        <div className="absolute top-3 left-3">
          <Badge className={cn('px-2 py-1 text-xs font-medium border-none', status.color)}>
            {status.label}
          </Badge>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/40 to-transparent">
          <div className="flex items-center justify-between text-white text-sm">
            <span className="font-semibold">From ${minPrice}</span>
            {service._count?.bookings > 0 && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded">
                {service._count.bookings} orders
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <Link href={`/service/${service.slug}`} target="_blank" className="block">
            <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors mb-2">
              {service.title}
            </h3>
          </Link>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <IconPackage className="h-3 w-3" />
                <span>{service.packages.length}</span>
              </div>

              <div className="flex items-center gap-1">
                <IconCalendar className="h-3 w-3" />
                <span>{service.packages[0]?.delivery || 0}d</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">Updated {updatedDate}</div>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between">
          <StatusSelector status={service.status} slug={service.slug} />
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" asChild>
              <Link href={`/dashboard/service/${service.slug}/edit`}>
                <IconEdit className="h-3.5 w-3.5" />
              </Link>
            </Button>

            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" asChild>
              <Link href={`/service/${service.slug}`} target="_blank">
                <IconExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
function StatusSelector({status, slug}: {status: string; slug: string}) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = [
    {value: 'DRAFT', label: 'Draft', color: 'text-gray-600', icon: '📝'},
    {value: 'ACTIVE', label: 'Active', color: 'text-green-600', icon: '✅'},
    {value: 'PAUSED', label: 'Paused', color: 'text-amber-600', icon: '⏸️'},
    {value: 'ARCHIVED', label: 'Archived', color: 'text-gray-500', icon: '📁'},
  ];

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      setCurrentStatus(newStatus);
      const {success, error, message} = await updateServiceStatus({
        slug,
        status: newStatus as any,
      });

      if (success) {
        toast.success(message || 'Status updated successfully');
      } else if (error) {
        toast.error(error || 'Failed to update status');
        // Revert on error
        setCurrentStatus(status);
      }
    } catch (error) {
      toast.error('An error occurred');
      setCurrentStatus(status);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentOption = statusOptions.find(opt => opt.value === currentStatus) || statusOptions[0];

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-8 px-3 text-xs font-medium gap-1.5 border transition-all',
                  'hover:shadow-sm',
                  isUpdating && 'opacity-70 cursor-not-allowed'
                )}
                disabled={isUpdating}
              >
                <span className={currentOption.color}>{currentOption.icon}</span>
                <span>{currentOption.label}</span>
                {isUpdating ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <IconArrowDown className="h-3 w-3 ml-auto" />
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Change service status</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuLabel className="text-xs font-medium">Update Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={currentStatus}
          onValueChange={handleStatusChange}
          className="space-y-1"
        >
          {statusOptions.map(option => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="text-sm gap-2 cursor-pointer py-2"
            >
              <span className={option.color}>{option.icon}</span>
              <span>{option.label}</span>
              {currentStatus === option.value && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <div className="text-xs text-muted-foreground">
            Active services are visible to clients
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ManageServiceCardComponent;
