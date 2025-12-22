'use client';

import {useState} from 'react';
import {AuthModal} from '@/lib/assets';

function GetStartedButton() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsAuthModalOpen(true)}
        className="py-2 px-4 rounded-md z-10"
        style={{color: 'black', backgroundColor: '#fef3c7'}}
      >
        Get started
      </button>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}

export default GetStartedButton;
