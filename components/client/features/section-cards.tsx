'use client';

import {IconMessage2, IconTrendingUp, IconClock, IconCheck} from '@tabler/icons-react';
import moment from 'moment';
import Link from 'next/link';

import {Badge} from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {cn} from '@/lib/utils';
import {BorderBeam} from '@/components/ui/border-beam';
import type {ClientActiveOrder} from '@/app/(freelancer-client)/dashboard/client/page';

export function ClientSectionCards({activeOrder}: {activeOrder: ClientActiveOrder}) {
  if (!activeOrder) return;

  const {service, freelancer, totalPrice, acceptedAt, delivery, status} = activeOrder;

  const deliveryAt = acceptedAt && acceptedAt.getTime() + delivery * 24 * 60 * 60 * 1000;

  const inXdays = deliveryAt ? moment(deliveryAt).fromNow() : null;

  const today = new Date();
  const dangerWindow = today.setDate(today.getDate() + 2);
  const lastDaysToDeliver = deliveryAt && dangerWindow >= deliveryAt;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-bl *:data-[slot=card]:shadow-xs  lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      {/* ================= ACTIVE ORDER ================= */}
      <Card
        className={cn(
          '@container/card h-full flex flex-col relative',
          lastDaysToDeliver && 'bg-red-100/10'
        )}
      >
        <BorderBeam
          duration={8}
          size={400}
          className="from-transparent via-primary/70 to-transparent"
        />
        {lastDaysToDeliver && (
          <BorderBeam
            duration={4}
            delay={3}
            size={400}
            borderWidth={2}
            className="from-transparent via-red-500 to-transparent"
          />
        )}

        <CardHeader className="space-y-1 pb-2">
          {/* Top row */}
          <div className="flex items-center justify-between">
            <CardDescription className="text-sm">Ordered from</CardDescription>

            <Badge variant="secondary" className="uppercase text-xs">
              {status}
            </Badge>
          </div>

          {/* Freelancer name */}
          <CardTitle className="text-2xl font-semibold">{freelancer.name}</CardTitle>

          {/* Service */}
          <p className="text-sm text-muted-foreground">{service.title}</p>

          {/* Price + Actions */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-3xl font-bold tabular-nums">${totalPrice}</span>

            <div className="flex gap-2">
              <Badge asChild variant="outline" className="cursor-pointer">
                <Link href={`/dashboard/messages/${freelancer.conversations[0]?.id}`}>
                  <IconMessage2 className="mr-1 h-4 w-4" />
                  Message
                </Link>
              </Badge>

              <Badge asChild variant="outline" className="cursor-pointer">
                <Link href="/client/bookings">View Order</Link>
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardFooter className="flex-col items-start pb-2 gap-1 text-sm">
          <div className="flex items-center gap-2 font-medium">
            Order in progress
            <IconTrendingUp className="h-4 w-4" />
          </div>

          <div
            className={cn(
              'text-muted-foreground text-balance',
              lastDaysToDeliver && 'text-md text-red-700'
            )}
          >
            {acceptedAt
              ? lastDaysToDeliver
                ? '⚠ Delivery expected very soon'
                : `Expected delivery ${inXdays}`
              : 'Waiting for freelancer acceptance'}
          </div>
        </CardFooter>
      </Card>

      {/* ================= DELIVERY COUNTDOWN ================= */}
      <Card className="@container/card relative">
        <BorderBeam
          duration={8}
          size={400}
          className="from-transparent via-primary/70 to-transparent"
        />

        <CardHeader>
          <CardDescription>Delivery Countdown</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {deliveryAt ? moment(deliveryAt).format('MMM DD') : '--'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconClock />
              {deliveryAt ? inXdays : 'Pending'}
            </Badge>
          </CardAction>

          <div className="flex w-full gap-1">
            <div className="h-1 flex-1 rounded bg-primary/80" />
            <div className="h-1 flex-1 rounded bg-primary/40" />
            <div className="h-1 flex-1 rounded bg-primary/20" />
          </div>

          <span className="text-xs text-muted-foreground mt-1">
            Automatically updates based on order status
          </span>
        </CardHeader>

        <CardFooter className="text-sm text-muted-foreground">
          Keep communication active to avoid delays
        </CardFooter>
      </Card>

      {/* ================= ORDER STATUS TIMELINE ================= */}
      <Card className="@container/card relative">
        <BorderBeam
          duration={8}
          size={400}
          className="from-transparent via-primary/70 to-transparent"
        />

        <CardHeader>
          <CardDescription>Order Status</CardDescription>
          <CardTitle className="text-2xl font-semibold @[250px]/card:text-3xl">Progress</CardTitle>
        </CardHeader>

        <CardFooter className="flex flex-col gap-2 text-sm">
          {['Order Placed', 'Freelancer Accepted', 'In Progress', 'Delivered'].map((label, i) => (
            <div key={label} className="flex items-center justify-between w-full">
              <span className="truncate">{label}</span>
              <Badge
                variant={
                  i < (status === 'DELIVERED' ? 4 : status === 'ACTIVE' ? 3 : 2)
                    ? 'secondary'
                    : 'outline'
                }
                className="text-xs"
              >
                {i < (status === 'DELIVERED' ? 4 : status === 'ACTIVE' ? 3 : 2) ? (
                  <IconCheck className="h-3 w-3" />
                ) : (
                  'Pending'
                )}
              </Badge>
            </div>
          ))}
        </CardFooter>
      </Card>
    </div>
  );
}
