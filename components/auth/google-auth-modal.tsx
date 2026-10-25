'use client';

import {useEffect, useState} from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {cloudGoogleSignIn} from '@/hooks/auth/cloud-auth';
import {toast} from 'sonner';
import {Loader2, UserPlus, GraduationCap, UserCheck, ArrowLeft, Check} from 'lucide-react';

interface GoogleAccountItem {
  name: string;
  email: string;
  avatar: string;
  defaultRole?: 'USER' | 'SELLER';
}

const STORAGE_KEY = '9arrini_google_accounts_v1';

const DEFAULT_GOOGLE_ACCOUNTS: GoogleAccountItem[] = [
  {
    name: 'Amina (Mon Compte Google)',
    email: 'amina.student@gmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Amina&background=059669&color=fff&bold=true',
    defaultRole: 'USER',
  },
  {
    name: 'Yassine Ben Amor (Élève)',
    email: 'yassine.benamor@gmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Yassine+Ben+Amor&background=2563eb&color=fff&bold=true',
    defaultRole: 'USER',
  },
  {
    name: 'Prof. Amine Mansour (Tuteur)',
    email: 'amine.mansour.prof@gmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Amine+Mansour&background=7c3aed&color=fff&bold=true',
    defaultRole: 'SELLER',
  },
];

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'USER' | 'SELLER';
}

export function GoogleAuthModal({
  isOpen,
  onClose,
  defaultRole = 'USER',
}: GoogleAuthModalProps) {
  const [accounts, setAccounts] = useState<GoogleAccountItem[]>(DEFAULT_GOOGLE_ACCOUNTS);
  const [role, setRole] = useState<'USER' | 'SELLER'>(defaultRole);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [addingAnother, setAddingAnother] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  useEffect(() => {
    setRole(defaultRole);
  }, [defaultRole]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAccounts(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  const handleOneClickAccountLogin = async (acc: GoogleAccountItem) => {
    setSelectedEmail(acc.email);
    const chosenRole = acc.defaultRole || role;
    try {
      const res = await cloudGoogleSignIn({
        email: acc.email,
        name: acc.name.replace(/\s*\(.*?\)\s*/g, '').trim(),
        role: chosenRole,
      });

      if (res.success) {
        toast.success(`Connecté en tant que ${acc.name} !`);
        onClose();
        window.location.href =
          res.redirectTo || (chosenRole === 'SELLER' ? '/dashboard/freelancer' : '/dashboard/client');
      } else {
        toast.error(res.error || 'Impossible de se connecter avec Google');
        setSelectedEmail(null);
      }
    } catch {
      toast.error('Erreur lors de la connexion Google');
      setSelectedEmail(null);
    }
  };

  const handleAddAnotherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;

    const finalEmail = customEmail.includes('@')
      ? customEmail.trim().toLowerCase()
      : `${customEmail.trim().toLowerCase()}@gmail.com`;

    const derivedName =
      customName.trim() ||
      finalEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

    const newAcc: GoogleAccountItem = {
      name: derivedName,
      email: finalEmail,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        derivedName
      )}&background=059669&color=fff&bold=true`,
      defaultRole: role,
    };

    try {
      const updated = [newAcc, ...accounts.filter(a => a.email !== finalEmail)];
      setAccounts(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    await handleOneClickAccountLogin(newAcc);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          setAddingAnother(false);
          setSelectedEmail(null);
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-2xl border shadow-2xl bg-white text-slate-900">
        {/* Top Google Branding Bar */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-200 flex items-center gap-2.5">
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
            />
          </svg>
          <span className="text-sm font-medium text-slate-600">Connexion avec Google</span>
        </div>

        <div className="px-6 pt-5 pb-6">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center h-11 w-11 rounded-full bg-emerald-50 border border-emerald-200 mb-3">
              <span className="text-lg font-black text-emerald-600">9</span>
            </div>
            <DialogTitle className="text-xl font-normal text-slate-900">
              {addingAnother ? 'Utiliser un autre compte' : 'Sélectionnez un compte'}
            </DialogTitle>
            <p className="text-sm text-slate-500 mt-1">
              pour continuer vers <span className="font-semibold text-emerald-700">9arrini.me</span>
            </p>
          </div>

          {/* Role Selector Pill */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 mb-4">
            <button
              type="button"
              onClick={() => setRole('USER')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                role === 'USER'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              Élève (+50 DT)
              {role === 'USER' && <Check className="h-3 w-3 text-emerald-600" />}
            </button>
            <button
              type="button"
              onClick={() => setRole('SELLER')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                role === 'SELLER'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              Professeur
              {role === 'SELLER' && <Check className="h-3 w-3 text-emerald-600" />}
            </button>
          </div>

          {!addingAnother ? (
            <>
              {/* Typical Google Account List */}
              <div className="divide-y divide-slate-200 border-t border-b border-slate-200 -mx-6">
                {accounts.map(acc => {
                  const isBusy = selectedEmail === acc.email;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      disabled={selectedEmail !== null}
                      onClick={() => handleOneClickAccountLogin({...acc, defaultRole: role})}
                      className="w-full flex items-center gap-3.5 px-6 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition text-left cursor-pointer disabled:opacity-60"
                    >
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{acc.name}</p>
                        <p className="text-xs text-slate-500 truncate">{acc.email}</p>
                      </div>
                      {isBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-600 shrink-0" />
                      ) : (
                        <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          1-clic
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Use another account row */}
                <button
                  type="button"
                  disabled={selectedEmail !== null}
                  onClick={() => setAddingAnother(true)}
                  className="w-full flex items-center gap-3.5 px-6 py-3.5 hover:bg-slate-50 transition text-left cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">Utiliser un autre compte</p>
                  </div>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
                Pour continuer, Google partagera votre nom, votre adresse e-mail et votre photo de
                profil avec 9arrini.me.
              </p>
            </>
          ) : (
            <form onSubmit={handleAddAnotherSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Input
                  type="email"
                  placeholder="Adresse e-mail Gmail (ex: nom@gmail.com)"
                  value={customEmail}
                  onChange={e => setCustomEmail(e.target.value)}
                  required
                  autoFocus
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Input
                  type="text"
                  placeholder="Votre nom (ex: Amina)"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAddingAnother(false)}
                  className="text-slate-600"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Retour à la liste
                </Button>

                <Button
                  type="submit"
                  disabled={selectedEmail !== null}
                  className="bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium px-6 cursor-pointer"
                >
                  {selectedEmail !== null ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    'Suivant'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
