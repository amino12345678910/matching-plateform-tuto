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
  if (!activeOrder) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-bl *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
        <Card className="@container/card h-full flex flex-col relative">
          <BorderBeam
            duration={8}
            size={400}
            className="from-transparent via-primary/70 to-transparent"
          />
          <CardHeader className="space-y-1 pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm">Current Learning Session</CardDescription>
              <Badge variant="outline" className="uppercase text-xs">
                Ready to Learn
              </Badge>
            </div>
            <CardTitle className="text-2xl font-semibold">No active lessons booked</CardTitle>
            <p className="text-sm text-muted-foreground">
              Browse verified tutors across 700+ subjects and book your first 1-on-1 lesson.
            </p>
          </CardHeader>
          <CardFooter className="pt-2">
            <Badge asChild variant="default" className="cursor-pointer px-3 py-1">
              <Link href="/explore">Find a Tutor</Link>
            </Badge>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const {service, freelancer, totalPrice, acceptedAt, delivery, status} = activeOrder;

  const deliveryAt = acceptedAt && new Date(acceptedAt).getTime() + delivery * 24 * 60 * 60 * 1000;

  const inXdays = deliveryAt ? moment(deliveryAt).fromNow() : null;

  const today = new Date();
  const dangerWindow = today.setDate(today.getDate() + 2);
  const lastDaysToDeliver = deliveryAt && dangerWindow >= deliveryAt;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-bl *:data-[slot=card]:shadow-xs  lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      {/* ================= ACTIVE LESSON ================= */}
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
            <CardDescription className="text-sm">Learning with Tutor</CardDescription>

            <Badge variant="secondary" className="uppercase text-xs">
              {status}
            </Badge>
          </div>

          {/* Tutor name */}
          <CardTitle className="text-2xl font-semibold">{freelancer.name}</CardTitle>

          {/* Session */}
          <p className="text-sm text-muted-foreground">{service.title}</p>

          {/* Price + Actions */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-2xl font-bold tabular-nums text-emerald-700">
              {totalPrice} Pts ({totalPrice} DT)
            </span>

            <div className="flex gap-2">
              <Badge asChild variant="outline" className="cursor-pointer">
                <Link href={`/dashboard/messages/${freelancer.conversations[0]?.id ?? ''}`}>
                  <IconMessage2 className="mr-1 h-4 w-4" />
                  Message
                </Link>
              </Badge>

              <Badge asChild variant="outline" className="cursor-pointer">
                <Link href="/dashboard/client/bookings">View Lesson</Link>
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardFooter className="flex-col items-start pb-2 gap-1 text-sm">
          <div className="flex items-center gap-2 font-medium">
            Lesson in progress
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
                ? '⚠ Next session milestone very soon'
                : `Expected completion ${inXdays}`
              : 'Waiting for tutor confirmation'}
          </div>
        </CardFooter>
      </Card>

      {/* ================= LESSON COUNTDOWN ================= */}
      <Card className="@container/card relative">
        <BorderBeam
          duration={8}
          size={400}
          className="from-transparent via-primary/70 to-transparent"
        />

        <CardHeader>
          <CardDescription>Course Schedule</CardDescription>
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
            Automatically updates based on lesson status
          </span>
        </CardHeader>

        <CardFooter className="text-sm text-muted-foreground">
          Message your tutor anytime with study questions
        </CardFooter>
      </Card>

      {/* ================= LESSON STATUS TIMELINE ================= */}
      <Card className="@container/card relative">
        <BorderBeam
          duration={8}
          size={400}
          className="from-transparent via-primary/70 to-transparent"
        />

        <CardHeader>
          <CardDescription>Lesson Status</CardDescription>
          <CardTitle className="text-2xl font-semibold @[250px]/card:text-3xl">Progress</CardTitle>
        </CardHeader>

        <CardFooter className="flex flex-col gap-2 text-sm">
          {['Lesson Booked', 'Tutor Confirmed', 'Learning in Progress', 'Completed'].map(
            (label, i) => (
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
            )
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
