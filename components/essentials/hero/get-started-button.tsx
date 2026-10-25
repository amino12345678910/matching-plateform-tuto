'use client';

import {useState} from 'react';
import {AuthModal} from '@/lib/assets';

function GetStartedButton() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsAuthModalOpen(true)}
        className="py-2.5 px-5 rounded-md z-10 font-semibold cursor-pointer"
        style={{color: 'black', backgroundColor: '#fef3c7'}}
      >
        Commencer maintenant
      </button>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}

export default GetStartedButton;
