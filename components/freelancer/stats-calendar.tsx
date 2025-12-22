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
  }, []);

  const busyRanges: BusyRange[] = useMemo(() => {
    return bookings.map(b => {
      const from = new Date(b.acceptedAt);
      const to = new Date(from);
      to.setDate(to.getDate() + b.delivery - 1);
      return {from, to};
    });
  }, [bookings]);

  const totalBusyDays = useMemo(() => bookings.reduce((sum, b) => sum + b.delivery, 0), [bookings]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Availability</CardTitle>
        <CardDescription>Your accepted bookings automatically block dates</CardDescription>
      </CardHeader>

      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[300px_1fr] items-center justify-center">
        <div className="space-y-4 flex flex-col ">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Active bookings</div>
            <div className="mt-1 text-2xl font-semibold">{bookings.length}</div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Total busy days</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl font-semibold">{totalBusyDays}</span>
              <Badge variant="secondary">days</Badge>
            </div>
          </div>

          <div className="rounded-lg border p-4 text-sm text-muted-foreground">
            Clients cannot book you on highlighted dates. You’ll be available again once delivery
            periods end.
          </div>
        </div>

        <div className="flex justify-center items-center ">
          <Calendar
            mode="single"
            numberOfMonths={2}
            disabled={busyRanges}
            showOutsideDays
            navLayout="after"
            today={new Date()}
            selected={new Date()}
            pagedNavigation={false}
            disableNavigation
            hideNavigation
            className="w-full max-w-2xl rounded-md border"
          />
        </div>
      </div>
    </Card>
  );
}
