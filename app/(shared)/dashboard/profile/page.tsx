'use client';

import Image from 'next/image';
import {useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Separator} from '@/components/ui/separator';
import {Skeleton} from '@/components/ui/skeleton';
import {Badge} from '@/components/ui/badge';
import {getUserInfo, type UserInfo} from '@/hooks/shared/get-user-info';
import {profilePhoto} from '@/components/profile-url';
import {storeImageToCloudinary} from '@/hooks/service/store-image';
import {updateImage} from '@/hooks/shared/update-image';
import {authClient} from '@/lib/auth-client';
import {setPassword} from '@/hooks/shared/update-password';
import {toast} from 'sonner';

export default function AccountPage() {
  const [user, setUser] = useState<UserInfo>();
  const [avatar, setAvatar] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [savingImage, setSavingImage] = useState(false);

  const [createPassword, setCreatePassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const u = await getUserInfo();
      setUser(u);

      const img = await profilePhoto({
        imageSource: u?.imageSource,
        imageUrl: u?.image,
      });

      setAvatar(img);
      setLoading(false);
    };

    init();
  }, []);

  /* ================================
     PROFILE IMAGE UPDATE
  ================================= */

  const handleUpdateImage = async () => {
    if (!imageFile) return;

    try {
      setSavingImage(true);

      const {cloudinaryImageUrls: upload} = await storeImageToCloudinary([imageFile], {
        pathOverride: 'seller/images',
        preset: 'five_seller_images',
      });

      if (!upload[0]) {
        throw new Error('Upload failed');
      }

      const {success} = await updateImage({imageUrl: upload[0], id: user?.userId!});
      if (!success) throw new Error('Upload failed');
      setAvatar(upload[0]);
      setPreview(null);
      setImageFile(null);
      setUser((u: any) => ({...u, image: upload[0]}));
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile photo');
    } finally {
      setSavingImage(false);
    }
  };

  /* ================================
     CREATE PASSWORD (OAUTH USERS)
  ================================= */

  const handleCreatePassword = async () => {
    if (createPassword.length < 8) {
      toast.info('Password must be at least 8 characters');
      return;
    }

    try {
      setPasswordLoading(true);

      if (!user?.userId) {
        console.log('User id not found');
        return;
      }
      const {status} = await setPassword({newPassword: createPassword, userId: user?.userId});

      if (!status) throw new Error('Could not set new password');
      else if (status) {
        setCurrentPassword('');
        setNewPassword('');
        toast.success('Password created');
      }

      setUser((u: any) => ({...u, hasPassword: true}));
      setCreatePassword('');
    } catch {
      toast.error('Could not create password');
    } finally {
      setPasswordLoading(false);
    }
  };

  /* ================================
     CHANGE PASSWORD
  ================================= */

  const handleChangePassword = async () => {
    if (!currentPassword || newPassword.length < 8) {
      toast.error('Invalid password');
      return;
    }

    try {
      setPasswordLoading(true);

      const {data, error} = await authClient.changePassword({
        newPassword: newPassword,
        currentPassword,
        revokeOtherSessions: true,
      });
      if (error) throw new Error(error?.message);
      else if (data?.token) {
        setCurrentPassword('');
        setNewPassword('');
        toast.success('Password updated');
      }
    } catch {
      toast.error('Current password is incorrect');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading || !user) {
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
  }

  const isFreelancer = user.role === 'SELLER';

  return (
    <div className="max-w-3xl px-8 py-10 space-y-10">
      {/* HEADER */}
      <section className="flex items-center gap-6">
        <div className="relative h-20 w-20">
          <Image
            src={preview || avatar || '/avatar.png'}
            alt="Profile photo"
            loading="eager"
            fill
            sizes="1"
            className="rounded-full object-cover border"
          />
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        <Badge variant="secondary">{isFreelancer ? 'Freelancer' : 'Client'}</Badge>
      </section>

      {/* COMPLETE ACCOUNT */}
      {(!user.image || !user.hasPassword) && (
        <section className="rounded-lg border bg-muted/30 p-4 text-sm">
          <p className="font-medium mb-2">Complete your account</p>
          <ul className="space-y-1 text-muted-foreground text-xs">
            {!user.image && <li>• Upload a profile photo</li>}
            {!user.hasPassword && <li>• Create a password</li>}
          </ul>
        </section>
      )}

      <Separator />

      {/* PROFILE IMAGE */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium">Profile photo</h3>

        <div className="flex items-center gap-4">
          <img
            src={preview || avatar}
            className="h-14 w-14 rounded-full border object-cover"
            alt="Preview"
          />

          <Input
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              setImageFile(file);
              setPreview(URL.createObjectURL(file));
            }}
          />

          <Button size="sm" onClick={handleUpdateImage} disabled={!imageFile || savingImage}>
            {savingImage ? 'Saving...' : 'Update'}
          </Button>
        </div>
      </section>

      <Separator />

      {/* PASSWORD */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium">Sign-in & security</h3>

        {!user.hasPassword ? (
          <div className="rounded-md border bg-muted/40 p-4 space-y-3">
            <Input
              type="password"
              placeholder="Create password"
              value={createPassword}
              onChange={e => setCreatePassword(e.target.value)}
            />
            <Button size="sm" onClick={handleCreatePassword} disabled={passwordLoading}>
              {passwordLoading ? 'Saving...' : 'Set password'}
            </Button>
          </div>
        ) : (
          <div className="rounded-md border p-4 space-y-3">
            <Input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleChangePassword}
              disabled={passwordLoading}
            >
              {passwordLoading ? 'Updating...' : 'Update password'}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
