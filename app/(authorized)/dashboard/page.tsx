import {redirect} from 'next/navigation';
import {getUserInfo} from '@/hooks/shared/get-user-info';

export default async function DashboardRedirectPage() {
  const {userId, role} = await getUserInfo();

  if (!userId) {
    redirect('/');
  }

  if (role === 'SELLER') {
    redirect('/dashboard/freelancer');
  }

  redirect('/dashboard/client');
}
