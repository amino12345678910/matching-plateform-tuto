'use client';

import Image from 'next/image';
import {useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Separator} from '@/components/ui/separator';
import {Skeleton} from '@/components/ui/skeleton';
import {Badge} from '@/components/ui/badge';
import {getUserInfo} from '@/hooks/get-user-info';
import {profilePhoto} from '@/components/profile-url';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [avatar, setAvatar] = useState<string>('');
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const u = await getUserInfo();
      setUser(u);

      const img = await profilePhoto({
        imageSource: u?.imageSource as any,
        imageUrl: u?.image,
      });
      setAvatar(img);
      setLoading(false);
    };
    init();
  }, []);

  if (loading || !user)
    return (
      <div className="max-w-3xl p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );

  const isFreelancer = user.role === 'SELLER';

  return (
    <div className="max-w-3xl px-8 py-10 space-y-10">
      <section className="flex items-center gap-6">
        <div className="relative h-20 w-20">
          <Image
            src={preview || avatar || '/avatar.png'}
            alt="Profile photo"
            fill
            className="rounded-full object-cover border"
          />
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        <Badge variant="secondary">{isFreelancer ? 'Freelancer' : 'Client'}</Badge>
      </section>

      {(!user.hasPassword || !user.image) && (
        <section className="rounded-lg border bg-muted/30 p-4 text-sm">
          <p className="font-medium mb-2">Complete your account</p>
          <ul className="space-y-1 text-muted-foreground text-xs">
            {!user.image && <li>• Upload a profile photo</li>}
            {!user.hasPassword && <li>• Create a password for email login</li>}
          </ul>
        </section>
      )}

      <Separator />

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">Profile photo</h3>
          <p className="text-xs text-muted-foreground">
            Visible to {isFreelancer ? 'clients' : 'freelancers'} across the platform.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <img
            src={preview || avatar}
            alt="Avatar preview"
            className="h-14 w-14 rounded-full object-cover border"
          />

          <Input
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              setPreview(URL.createObjectURL(file));
            }}
          />
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">Sign-in & security</h3>
          <p className="text-xs text-muted-foreground">Manage how you access your account.</p>
        </div>

        {!user.hasPassword ? (
          <div className="rounded-md border bg-muted/40 p-4 space-y-3">
            <p className="text-sm font-medium">Create password</p>
            <p className="text-xs text-muted-foreground">
              You signed up using Google. Adding a password lets you log in with email.
            </p>

            <Input type="password" placeholder="Create password" />
            <Button size="sm">Set password</Button>
          </div>
        ) : (
          <div className="rounded-md border p-4 space-y-3">
            <p className="text-sm font-medium">Change password</p>

            <Input type="password" placeholder="Current password" />
            <Input type="password" placeholder="New password" />

            <Button size="sm" variant="outline">
              Update password
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
