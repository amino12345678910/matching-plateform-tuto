'use client';

import {useEffect, useMemo, useState} from 'react';
import {Calendar} from '@/components/ui/calendar';
import {Card, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {getMySchedule} from '@/hooks/freelancers/dashboard/get-my-schedule';

type Booking = {
  acceptedAt: Date;
  delivery: number;
};

type BusyRange = {
  from: Date;
  to: Date;
};

export default function FreelancerCalendar({fId}: {fId: string}) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const init = async () => {
      const {success, timing} = await getMySchedule({fId});
      if (!success) return;

      setBookings(
        timing.map(t => ({
          acceptedAt: new Date(t.acceptedAt!),
          delivery: t.delivery,
        }))
      );
    };

    init();
  }, [fId]);

  const busyRanges: BusyRange[] = useMemo(() => {
    return bookings.map(b => {
      const from = new Date(b.acceptedAt);
      const to = new Date(from);
      to.setDate(to.getDate() + b.delivery - 1);
      return {from, to};
    });
  }, [bookings]);

  const pastFreeRanges = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookings
      .map(b => {
        const start = new Date(b.acceptedAt);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + b.delivery - 1);

        return {end};
      })
      .filter(({end}) => end >= today);
  }, [bookings]);

  const totalBusyDays = useMemo(() => bookings.reduce((sum, b) => sum + b.delivery, 0), [bookings]);

  const months = useMemo(() => {
    if (typeof window === 'undefined') return 1;
    return window.innerWidth < 640 ? 1 : 2;
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability</CardTitle>
        <CardDescription>Your accepted bookings automatically block dates</CardDescription>
      </CardHeader>

      <div className="grid gap-6 p-6 lg:grid-cols-[280px_1fr]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Active bookings</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl font-semibold">{pastFreeRanges ? 0 : bookings.length}</span>
              <Badge variant="secondary">counts</Badge>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Total busy days</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl font-semibold">{pastFreeRanges ? 0 : totalBusyDays}</span>
              <Badge variant="secondary">days</Badge>
            </div>
          </div>

          <div className="rounded-lg border p-4 text-sm text-muted-foreground sm:col-span-2 lg:col-span-1">
            Clients cannot book you on highlighted dates. You’ll be available again once delivery
            periods end.
          </div>
        </div>

        <div className="flex justify-center lg:justify-start">
          <Calendar
            mode="single"
            numberOfMonths={months}
            disabled={!pastFreeRanges ? busyRanges : undefined}
            showOutsideDays
            today={new Date()}
            selected={new Date()}
            hideNavigation
            className="w-full  rounded-md border flex"
            classNames={{
              months: 'flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 flex-1',
              month: 'space-y-4 w-full flex flex-col',
            }}
          />
        </div>
      </div>
    </Card>
  );
}
