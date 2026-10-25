'use client';

import {useState} from 'react';
import {cn} from '@/lib/utils';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Badge} from '@/components/ui/badge';
import {cloudSignUp} from '@/hooks/auth/cloud-auth';
import {Alert, AlertDescription, AlertTitle} from '../ui/alert';
import {Terminal, GraduationCap, BookOpen, ShieldCheck, Clock} from 'lucide-react';
import {IconLoader, IconBrandGoogle} from '@tabler/icons-react';
import {toast} from 'sonner';

export function SignupForm({className, ...props}: React.ComponentProps<'div'>) {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'SELLER'>('USER');

  // Tutor application fields
  const [specialty, setSpecialty] = useState('');
  const [credentials, setCredentials] = useState('');
  const [experience, setExperience] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isTutor = role === 'SELLER';

  const signUpWithGoogle = () => {
    window.location.href = `/api/auth/google?role=${encodeURIComponent(role)}`;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isTutor && (!specialty.trim() || !credentials.trim() || !phone.trim())) {
      setError(
        'Veuillez compléter votre spécialité, votre diplôme et votre numéro de téléphone pour soumettre votre candidature Professeur.'
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await cloudSignUp({
        name: fullname,
        email,
        password,
        role,
        specialty: isTutor ? specialty : undefined,
        credentials: isTutor ? credentials : undefined,
        experience: isTutor ? experience : undefined,
        phone: isTutor ? phone : undefined,
        bio: isTutor ? bio : undefined,
      });

      if (res.success) {
        if (isTutor) {
          toast.success(
            'Candidature Professeur envoyée ! Votre compte aura l’accès complet dès validation par l’équipe 9arrini.'
          );
        } else {
          toast.success('Compte Élève créé avec succès ! (+50 Points = 50 DT offerts)');
        }
        window.location.href =
          res.redirectTo || (role === 'SELLER' ? '/dashboard/freelancer' : '/dashboard/client');
        return;
      } else {
        setError(res.error || 'Impossible de créer le compte.');
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="border-2 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl font-bold">
            {isTutor ? 'Candidature & Compte Professeur' : 'Créer un Compte Élève'}
          </CardTitle>
          <CardDescription>
            Choisissez votre espace sur 9arrini (Élève ou Professeur)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Role Separation Cards */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('USER')}
              className={cn(
                'flex flex-col items-start p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer',
                !isTutor
                  ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-xs'
                  : 'border-border hover:border-emerald-300 bg-card'
              )}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                  <GraduationCap className="h-4 w-4 text-emerald-600" />
                  Compte Élève
                </span>
                <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0">
                  Accès direct
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Réserver des cours, payer en Points et rejoindre Google Meet.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setRole('SELLER')}
              className={cn(
                'flex flex-col items-start p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer',
                isTutor
                  ? 'border-amber-600 bg-amber-50/80 dark:bg-amber-950/40 shadow-xs'
                  : 'border-border hover:border-amber-300 bg-card'
              )}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                  <BookOpen className="h-4 w-4 text-amber-600" />
                  Compte Professeur
                </span>
                <Badge
                  variant="outline"
                  className="border-amber-500/40 bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0"
                >
                  Sur candidature
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Postuler pour enseigner (vérifié par l&apos;équipe 9arrini).
              </p>
            </button>
          </div>

          {isTutor && (
            <div className="rounded-xl border border-amber-300 bg-amber-50/90 dark:bg-amber-950/30 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Vérification obligatoire avant l&apos;accès complet Professeur</span>
              </div>
              <p className="text-[11px] text-amber-900/85 dark:text-amber-200/80 leading-relaxed">
                Les professeurs doivent d&apos;abord postuler avec leurs références académiques. Votre
                accès complet pour publier des cours et recevoir des élèves est activé dès validation de
                votre compte par l&apos;administration 9arrini.
              </p>
            </div>
          )}

          {error && (
            <Alert className="border border-red-500" variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Erreur d&apos;inscription</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="button"
            onClick={signUpWithGoogle}
            variant="outline"
            className="w-full h-11 font-semibold border-2"
          >
            <IconBrandGoogle className="h-4 w-4 mr-2 text-emerald-600" />
            {isTutor
              ? 'Postuler avec Google (Compte Professeur)'
              : 'S’inscrire avec Google (Compte Élève)'}
          </Button>

          <div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-card px-2 text-muted-foreground">
              Ou par formulaire Email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                onChange={e => setFullname(e.target.value)}
                value={fullname}
                id="name"
                type="text"
                placeholder={isTutor ? 'Prof. Yassine Ben Ali' : 'Votre nom et prénom'}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
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
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                onChange={e => setPassword(e.target.value)}
                value={password}
                id="password"
                type="password"
                placeholder="Créer un mot de passe"
                required
              />
            </div>

            {isTutor && (
              <div className="rounded-xl border border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 space-y-3">
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  Dossier de Candidature Professeur
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="specialty" className="text-xs">
                      Matière / Spécialité *
                    </Label>
                    <Input
                      id="specialty"
                      placeholder="Ex: Mathématiques, Python..."
                      value={specialty}
                      onChange={e => setSpecialty(e.target.value)}
                      required
                      className="bg-white text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="credentials" className="text-xs">
                      Diplôme / Titre académique *
                    </Label>
                    <Input
                      id="credentials"
                      placeholder="Ex: Agrégé, Ingénieur, Master..."
                      value={credentials}
                      onChange={e => setCredentials(e.target.value)}
                      required
                      className="bg-white text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="experience" className="text-xs">
                      Expérience pédagogique *
                    </Label>
                    <Input
                      id="experience"
                      placeholder="Ex: 5 ans d'enseignement"
                      value={experience}
                      onChange={e => setExperience(e.target.value)}
                      required
                      className="bg-white text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-xs">
                      Téléphone / WhatsApp *
                    </Label>
                    <Input
                      id="phone"
                      placeholder="Ex: +216 22 000 000"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                      className="bg-white text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="bio" className="text-xs">
                    Présentation & Méthodologie *
                  </Label>
                  <Textarea
                    id="bio"
                    rows={2}
                    placeholder="Décrivez votre parcours et les niveaux que vous accompagnez..."
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    required
                    className="bg-white text-xs"
                  />
                </div>
              </div>
            )}

            <Button
              disabled={loading}
              type="submit"
              className={cn(
                'w-full h-11 font-bold text-white',
                isTutor ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
              )}
            >
              {loading ? (
                <IconLoader className="animate-spin mr-2" stroke={2} />
              ) : isTutor ? (
                'Envoyer ma Candidature Professeur'
              ) : (
                'Créer mon Compte Élève (+50 Pts)'
              )}
            </Button>

            <div className="mt-4 text-center text-sm">
              Vous avez déjà un compte ?{' '}
              <a href="/auth/login" className="font-semibold text-emerald-700 underline underline-offset-4">
                Se connecter
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
