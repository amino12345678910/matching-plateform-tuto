import {redirect} from 'next/navigation';
import {getUserInfo} from '@/hooks/shared/get-user-info';

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserInfo();

  if (!user?.userId) {
    redirect('/auth/login');
  }

  const configuredAdmins = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  if (
    configuredAdmins.length > 0 &&
    user.role !== 'ADMIN' &&
    !configuredAdmins.includes((user.email || '').toLowerCase())
  ) {
    redirect('/');
  }

  return <div className="min-h-screen bg-background">{children}</div>;
}
