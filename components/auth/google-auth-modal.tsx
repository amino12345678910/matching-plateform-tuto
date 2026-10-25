'use client';

import {useState} from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {cloudGoogleSignIn} from '@/hooks/auth/cloud-auth';
import {toast} from 'sonner';
import {Loader2, GraduationCap, UserCheck} from 'lucide-react';

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
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'USER' | 'SELLER'>(defaultRole);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Veuillez saisir votre adresse Gmail / Google');
      return;
    }

    setLoading(true);
    try {
      const finalEmail = email.includes('@') ? email.trim() : `${email.trim()}@gmail.com`;
      const res = await cloudGoogleSignIn({
        email: finalEmail,
        name: name.trim() || undefined,
        role,
      });

      if (res.success) {
        toast.success('Connecté avec Google ! Mar7bé bik fi 9arrini (+50 Pts / 50 DT)');
        onClose();
        window.location.href =
          res.redirectTo || (role === 'SELLER' ? '/dashboard/freelancer' : '/dashboard/client');
      } else {
        toast.error(res.error || 'Erreur de connexion Google');
        setLoading(false);
      }
    } catch {
      toast.error('Erreur lors de la connexion Google');
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader className="items-center text-center space-y-2">
          {/* Official Google G SVG */}
          <div className="h-12 w-12 rounded-full bg-white border shadow-xs flex items-center justify-center mx-auto">
            <svg className="h-6 w-6" viewBox="0 0 24 24">
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
          </div>
          <DialogTitle className="text-xl font-bold">Connexion avec Google</DialogTitle>
          <DialogDescription>
            Accéder à <span className="font-semibold text-emerald-700">9arrini.me</span> avec votre
            compte Google
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="google-email">Adresse Gmail ou Google Workspace *</Label>
            <Input
              id="google-email"
              type="email"
              placeholder="votre.nom@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="google-name">Nom complet (optionnel)</Label>
            <Input
              id="google-name"
              type="text"
              placeholder="Ex: Amine Ben Ali"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Type de compte sur 9arrini</Label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRole('USER')}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left text-xs font-semibold transition cursor-pointer ${
                  role === 'USER'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-border hover:border-emerald-300'
                }`}
              >
                <UserCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <div>
                  <div>Élève / Étudiant</div>
                  <div className="text-[10px] font-normal text-muted-foreground">
                    +50 Pts (50 DT)
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('SELLER')}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left text-xs font-semibold transition cursor-pointer ${
                  role === 'SELLER'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-border hover:border-emerald-300'
                }`}
              >
                <GraduationCap className="h-4 w-4 text-emerald-600 shrink-0" />
                <div>
                  <div>Professeur</div>
                  <div className="text-[10px] font-normal text-muted-foreground">
                    Donner des cours
                  </div>
                </div>
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connexion à Google...
              </>
            ) : (
              'Continuer avec Google'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
