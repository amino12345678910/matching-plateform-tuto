'use client';

export const setPendingRole = (role: 'USER' | 'SELLER') => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pendingRole', role);
  }
};

export const getPendingRole = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('pendingRole');
  }
  return null;
};

export const clearPendingRole = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pendingRole');
  }
};
