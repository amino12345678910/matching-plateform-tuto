'use client';

import {useState} from 'react';
import {cn} from '@/lib/utils';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {cloudSignIn} from '@/hooks/auth/cloud-auth';
import {Alert, AlertDescription} from '../ui/alert';
import {Terminal, GraduationCap, BookOpen} from 'lucide-react';
import {toast} from 'sonner';
import {IconLoader, IconBrandGoogle} from '@tabler/icons-react';

export function LoginForm({className, ...props}: React.ComponentProps<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'SELLER'>('USER');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isTutor = role === 'SELLER';

  const signInWithGoogle = () => {
    window.location.href = `/api/auth/google?role=${encodeURIComponent(role)}`;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await cloudSignIn({email, password});
      if (res.success) {
        toast.success('Connexion réussie ! Mar7bé bik fi 9arrini');
        window.location.href =
          res.redirectTo || (role === 'SELLER' ? '/dashboard/freelancer' : '/dashboard/client');
        return;
      } else {
        setError(res.error || 'Impossible de se connecter.');
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la connexion.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            {isTutor ? 'Connexion Espace Professeur' : 'Connexion Espace Élève'}
          </CardTitle>
          <CardDescription>
            Sélectionnez votre espace pour vous connecter à votre compte 9arrini
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('USER')}
              className={cn(
                'flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all cursor-pointer',
                !isTutor
                  ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40'
                  : 'border-border hover:border-emerald-300 bg-card'
              )}
            >
              <GraduationCap className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-xs">Compte Élève</div>
                <div className="text-[10px] text-muted-foreground">Étudiant</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('SELLER')}
              className={cn(
                'flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all cursor-pointer',
                isTutor
                  ? 'border-amber-600 bg-amber-50/80 dark:bg-amber-950/40'
                  : 'border-border hover:border-amber-300 bg-card'
              )}
            >
              <BookOpen className="h-4 w-4 text-amber-600 shrink-0" />
              <div>
                <div className="font-bold text-xs">Compte Professeur</div>
                <div className="text-[10px] text-muted-foreground">Espace Tuteur</div>
              </div>
            </button>
          </div>

          {error && (
            <Alert className="border border-red-500" variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="button"
            onClick={signInWithGoogle}
            variant="outline"
            className="w-full h-11 font-semibold border-2"
          >
            <IconBrandGoogle className="h-4 w-4 mr-2 text-emerald-600" />
            {isTutor
              ? 'Continuer avec Google (Compte Professeur)'
              : 'Continuer avec Google (Compte Élève)'}
          </Button>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                onChange={e => setEmail(e.target.value)}
                value={email}
                id="email"
                type="email"
                placeholder="email@exemple.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                onChange={e => setPassword(e.target.value)}
                value={password}
                id="password"
                type="password"
                required
              />
            </div>

            <Button
              disabled={loading}
              type="submit"
              className={cn(
                'w-full h-11 font-bold text-white',
                isTutor ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
              )}
            >
              {loading ? <IconLoader className="animate-spin mr-2" stroke={2} /> : null}
              {isTutor ? 'Se connecter (Espace Professeur)' : 'Se connecter (Espace Élève)'}
            </Button>

            <div className="mt-4 text-center text-sm">
              Pas encore de compte ?{' '}
              <a href="/auth/signup" className="font-semibold text-emerald-700 underline underline-offset-4">
                S&apos;inscrire (Élève ou Candidature Prof)
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
