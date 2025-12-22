'use client';

import Image from 'next/image';
import {useState} from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import freelancerVector from '@/public/assets/freelancerVector.svg';
import userVector from '@/public/assets/userVector.svg';

interface RoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelect: (role: 'USER' | 'SELLER') => void;
  authType: 'google' | 'email';
}

export function RoleDialog({isOpen, onClose, onRoleSelect, authType}: RoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<'USER' | 'SELLER' | null>(null);

  const handleSelect = (role: 'USER' | 'SELLER') => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Your Role</DialogTitle>
          <DialogDescription>
            {authType === 'google'
              ? 'Select your role before continuing with Google sign-in'
              : 'Select your role to continue'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Option */}
          <button
            type="button"
            onClick={() => handleSelect('USER')}
            className={`flex gap-4 items-start p-4 rounded-lg w-full text-left border-2 transition-all ${
              selectedRole === 'USER'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex-shrink-0">
              <Image src={userVector} alt="User" width={56} height={56} className="pr-3 border-r" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">USER</h3>
              <p className="text-xs text-muted-foreground mt-1">
                I want to hire freelancers for services.
              </p>
            </div>
          </button>

          {/* Freelancer Option */}
          <button
            type="button"
            onClick={() => handleSelect('SELLER')}
            className={`flex gap-4 items-start p-4 rounded-lg w-full text-left border-2 transition-all ${
              selectedRole === 'SELLER'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex-shrink-0">
              <Image
                src={freelancerVector}
                alt="Freelancer"
                width={56}
                height={56}
                className="pr-3 border-r"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">FREELANCER</h3>
              <p className="text-xs text-muted-foreground mt-1">
                I want to offer services and earn money.
              </p>
            </div>
          </button>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleContinue} disabled={!selectedRole} className="flex-1">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
