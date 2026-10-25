'use client';
import React, {useState} from 'react';

import {authClient} from '@/lib/auth-client';
import {clearCloudSessionCookie} from '@/hooks/auth/cloud-auth';
import {useRouter} from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleLogOut() {
    setLoading(true);
    try {
      await clearCloudSessionCookie();
      await authClient.signOut();
    } catch {
      // ignore
    } finally {
      setLoading(false);
      router.push('/auth/login');
      window.location.href = '/auth/login';
    }
  }
  return <button onClick={() => handleLogOut()}>{loading ? 'Déconnexion...' : 'Déconnexion'}</button>;
}
