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
  IconVideo,
  IconCopy,
} from '@tabler/icons-react';
import {updateServiceStatus} from '@/hooks/service/update-status';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';
import {Skeleton} from '../../../ui/skeleton';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {defaultRoute} from '@/app/(freelancer-client)/dashboard/freelancer/config';
import {getServiceMeetInfo} from '@/lib/google-meet';

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
  const meetInfo = getServiceMeetInfo(service as any);

  // const updatedDate = new Date(service.updatedAt).toLocaleDateString('en-US', {
  //   month: 'short',
  //   day: 'numeric',
  // });

  return (
    <div className="group relative w-full overflow-hidden rounded-lg border border-border bg-card hover:border-primary/30 transition-colors duration-200">
      <div className="group rounded-xl border bg-card hover:shadow-md transition overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[16/9] bg-muted">
          {!imageLoaded && <Skeleton className="absolute inset-0" />}
          <Image
            src={primaryImage}
            alt={service.title}
            fill
            className={cn(
              'object-cover transition-transform duration-300',
              imageLoaded ? 'opacity-100' : 'opacity-0',
              'group-hover:scale-[1.03]'
            )}
            onLoad={() => setImageLoaded(true)}
          />

          <Badge className={cn('absolute top-3 left-3 text-xs px-2 py-0.5', status.color)}>
            {status.label}
          </Badge>
        </div>

        <div className="p-4 space-y-3">
          <Link href={`/service/${service.slug}`} target="_blank">
            <h3 className="text-sm font-semibold line-clamp-2 hover:text-primary">
              {service.title}
            </h3>
          </Link>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <IconPackage className="h-3 w-3" />
                {service.packages.length} packages
              </span>
              <span className="flex items-center gap-1">
                <IconCalendar className="h-3 w-3" />
                {service.packages[0]?.delivery}d
              </span>
            </div>

            <span>From {minPrice} Pts ({minPrice} DT)</span>
          </div>

          {/* Automatic Google Meet & Schedule Box */}
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-2.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-emerald-900 font-semibold">
              <span className="flex items-center gap-1">
                <IconVideo className="h-3.5 w-3.5 text-emerald-600" />
                Google Meet prêt
              </span>
              <span className="text-[11px] text-emerald-700">{meetInfo.formattedDateLabel}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] font-bold text-emerald-700 truncate">
                {meetInfo.meetUrl}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(meetInfo.meetUrl);
                    toast.success('Lien Google Meet copié !');
                  }}
                  className="p-1 rounded hover:bg-emerald-100 text-emerald-700 cursor-pointer"
                  title="Copier le lien Meet"
                >
                  <IconCopy className="h-3.5 w-3.5" />
                </button>
                <a
                  href={meetInfo.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold"
                >
                  Ouvrir Meet
                </a>
              </div>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between">
            <StatusSelector
              status={service.status}
              slug={service.slug}
              bookingCount={service._count.bookings}
            />

            <div className="flex gap-1">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`${defaultRoute}/service/${service.slug}`}>
                  <IconEdit className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/service/${service.slug}`} target="_blank">
                  <IconExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function StatusSelector({
  status,
  slug,
  bookingCount,
}: {
  status: string;
  slug: string;
  bookingCount: number;
}) {
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
  const isChangable = bookingCount > 0;

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
                disabled={isUpdating || isChangable}
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
