'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';
import {getPendingRole, clearPendingRole} from '@/lib/sessions';
import {updateUserRole} from '@/hooks/update-role';
import {getUserInfo} from '@/hooks/shared/get-user-info';

export default function RegistrationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const completeRegistration = async () => {
      try {
        const pendingRole = getPendingRole();

        if (!pendingRole) {
          throw new Error('No role selected. Please try signing in again.');
        }

        const {email, userId} = await getUserInfo();
        if (!userId || !email) throw new Error('Failed to get user session. Please try again.');

        if (!email) throw new Error('No email found in user session.');

        const {error: updateError, success} = await updateUserRole(email, pendingRole as any);

        if (!updateError && !success) {
          throw new Error(updateError || 'Failed to update user role.');
        }

        toast.success('Registration completed successfully!');
        router.push(pendingRole === 'SELLER' ? '/dashboard/freelancer' : '/dashboard/client');
        clearPendingRole();
      } catch (error: any) {
        console.error('Registration completion error:', error);
        setError(error.message || 'Something went wrong. Please try again.');
        clearPendingRole();

        setTimeout(() => {
          router.push('/');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    completeRegistration();
  }, [router]);

  if (loading) {
    return (
      <main className="grid items-center justify-center w-full h-full max-w-[100svw] max-h-[100vh]">
        <div className="flex flex-col items-center justify-center w-full h-full px-4">
          <h1 className="text-2xl font-semibold mb-4 tracking-tighter">
            Completing your registration...
          </h1>
          <p className="text-center text-muted-foreground mb-4 tracking-tight">
            Please wait while we finalize your account setup.
          </p>
          <div className="loader border-t-2 border border-primary rounded-full w-8 h-8 animate-spin"></div>
        </div>
      </main>
    );
  }

  if (!loading && error) {
    return (
      <main className="grid items-center justify-center w-full h-full max-w-[100svw] max-h-[100vh]">
        <div className="flex flex-col items-center justify-center w-full h-full px-4 max-w-md">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h1 className="text-2xl font-semibold mb-4 text-red-700 tracking-tighter">
              Registration Error
            </h1>
            <p className="text-center text-red-600 mb-6 tracking-tight">{error}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Return to Home
              </button>
              <button
                onClick={() => router.push('/auth/signup')}
                className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
