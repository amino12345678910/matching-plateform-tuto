import SelectRoleComponent from '@/components/auth/select-role';
import {getUserInfo} from '@/hooks/get-user-info';
import {redirect} from 'next/navigation';

export default async function SelectRolePage() {
  const {role, userId} = await getUserInfo();
  if (role !== null || !userId) return redirect('/explore');
  return (
    <main className="container min-h-svh max-w-screen mx-auto  flex flex-col w-full items-center justify-center">
      <SelectRoleComponent />
    </main>
  );
}
