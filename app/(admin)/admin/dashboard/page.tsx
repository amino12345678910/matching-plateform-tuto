import {getAdminDashboardData} from '@/hooks/admin/admin-actions';
import {AdminDashboardClient} from '@/components/admin/admin-dashboard-client';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();
  return <AdminDashboardClient initialData={data} />;
}
