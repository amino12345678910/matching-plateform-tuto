'use client';

import {useState} from 'react';
import type {UserInfo} from '@/hooks/get-user-info';
import {Input} from '../ui/input';
import {Button} from '../ui/button';
import {profilePhoto} from '../profile-url';

function UserProfile({user}: {user: UserInfo}) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <section className="max-w-xl">
      <div className="flex items-center gap-4 mb-10">
        <img
          src={preview || profilePhoto()}
          alt="Profile"
          className="h-14 w-14 rounded-full object-cover border border-[#e5e7eb]"
        />

        <div className="flex-1">
          <p className="font-medium text-[15px]">{user.name}</p>
          <p className="text-xs text-[#6b7280]">{user.email}</p>
        </div>
      </div>

      {/* Profile photo */}
      <div className="mb-10">
        <label className="block text-sm font-medium mb-2">Profile photo</label>

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

      {/* Password section */}
      <div className="space-y-5">
        <h3 className="text-sm font-medium">
          {user.hasPassword ? 'Change password' : 'Create password'}
        </h3>

        <div className="space-y-4">
          {user.hasPassword && <Input type="password" placeholder="Current password" />}

          <Input
            type="password"
            placeholder={user.hasPassword ? 'New password' : 'Create password'}
          />
        </div>

        <Button type="button">{user.hasPassword ? 'Update password' : 'Set password'}</Button>

        {!user.hasPassword && (
          <p className="text-xs text-[#6b7280]">
            You signed up using Google. Creating a password lets you log in without Google.
          </p>
        )}
      </div>
    </section>
  );
}

export default UserProfile;
