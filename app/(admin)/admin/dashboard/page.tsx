import {ChartAreaInteractive} from '@/components/chart-area-interactive';
import {DataTable} from '@/components/data-table';
import {SectionCards} from '@/components/freelancer/section-cards';
import data from '../../data.json';
import FreelancerCalendar from '@/components/freelancer/stats-calendar';

export default async function Page() {
  return (
    <>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <div className="px-4 lg:px-6">
        <FreelancerCalendar />
      </div>
      <DataTable data={data} />
    </>
  );
}
