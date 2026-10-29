'use client';

import {useState} from 'react';
import Link from 'next/link';
import {cn} from '@/lib/utils';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Badge} from '@/components/ui/badge';
import {cloudSignUp} from '@/hooks/auth/cloud-auth';
import {Alert, AlertDescription, AlertTitle} from '../ui/alert';
import {
  Terminal,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import {IconLoader, IconBrandGoogle} from '@tabler/icons-react';
import {toast} from 'sonner';
import {
  STUDENT_LEVELS,
  LYCEE_SECTIONS,
  PAYOUT_METHODS,
  gradeNeedsSection,
  type StudentLevel,
} from '@/lib/constants';

export function SignupForm({className, ...props}: React.ComponentProps<'div'>) {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'SELLER'>('USER');

  // Shared contact
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  // Student academic categorization fields
  const [studentLevel, setStudentLevel] = useState<StudentLevel>('LYCEE');
  const [studentGrade, setStudentGrade] = useState('BAC');
  const [studentSection, setStudentSection] = useState('MATH');
  const [institution, setInstitution] = useState('');

  // Tutor application fields
  const [specialty, setSpecialty] = useState('');
  const [credentials, setCredentials] = useState('');
  const [experience, setExperience] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('D17');
  const [payoutAccount, setPayoutAccount] = useState('');
  const [bio, setBio] = useState('');

  // Mandatory Legal Terms & Conditions
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isTutor = role === 'SELLER';
  const currentLevelObj =
    STUDENT_LEVELS.find(l => l.value === studentLevel) || STUDENT_LEVELS[2];
  const needsSection = studentLevel === 'LYCEE' && gradeNeedsSection(studentGrade);

  const handleLevelChange = (newLevel: StudentLevel) => {
    setStudentLevel(newLevel);
    const found = STUDENT_LEVELS.find(l => l.value === newLevel);
    if (found && found.grades[0]) {
      setStudentGrade(found.grades[0].value);
    }
  };

  const signUpWithGoogle = () => {
    if (!acceptedTerms) {
      setError(
        "Veuillez cocher la case d'acceptation des Conditions Générales d'Utilisation (CGU) avant de continuer."
      );
      return;
    }
    window.location.href = `/api/auth/google?role=${encodeURIComponent(role)}`;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptedTerms) {
      setError(
        "Veuillez accepter les Conditions Générales d'Utilisation (CGU) pour créer votre compte."
      );
      return;
    }

    if (!isTutor && (!studentLevel || !studentGrade || !city.trim())) {
      setError(
        'Veuillez sélectionner votre niveau scolaire, votre classe et votre ville afin de vous classer dans votre catégorie.'
      );
      return;
    }

    if (
      isTutor &&
      (!specialty.trim() ||
        !credentials.trim() ||
        !phone.trim() ||
        !city.trim() ||
        !payoutAccount.trim() ||
        bio.trim().length < 30)
    ) {
      setError(
        'Votre profil professeur doit être complet : spécialité, diplôme, expérience, téléphone, ville, compte D17/RIB et présentation détaillée (min. 30 caractères).'
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
        phone,
        city,
        acceptedTerms: true,
        // Student details
        studentLevel: !isTutor ? studentLevel : undefined,
        studentGrade: !isTutor ? studentGrade : undefined,
        studentSection: !isTutor && needsSection ? studentSection : undefined,
        institution: !isTutor ? institution : undefined,
        // Tutor details
        specialty: isTutor ? specialty : undefined,
        credentials: isTutor ? credentials : undefined,
        experience: isTutor ? experience : undefined,
        payoutMethod: isTutor ? payoutMethod : undefined,
        payoutAccount: isTutor ? payoutAccount : undefined,
        bio: isTutor ? bio : undefined,
      });

      if (res.success) {
        if (isTutor) {
          toast.success(
            "Candidature Professeur envoyée ! Ajoutez votre photo de profil dans votre espace pour accélérer la validation par l'équipe 9arrini."
          );
        } else {
          toast.success(
            'Compte Élève créé ! Profitez de la semaine de lancement 100% gratuite.'
          );
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
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 w-fit mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Semaine de lancement : 100% Gratuit pendant 7 jours
          </div>
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
                  Essai Gratuit
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Réserver vos séances selon votre classe et noter vos professeurs après cours.
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
                  Profil vérifié
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Enseigner en direct (85% reversés au professeur après validation élève).
              </p>
            </button>
          </div>

          {isTutor && (
            <div className="rounded-xl border border-amber-300 bg-amber-50/90 dark:bg-amber-950/30 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Profil 100% complet requis avant vérification</span>
              </div>
              <p className="text-[11px] text-amber-900/85 dark:text-amber-200/80 leading-relaxed">
                Pour garantir la confiance des élèves, chaque professeur doit fournir son identité
                réelle, ses diplômes, sa biographie complète, sa photo de profil et son numéro
                D17/RIB. Commission plateforme après la semaine gratuite : 15% (85% pour vous).
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom et prénom réels *</Label>
              <Input
                onChange={e => setFullname(e.target.value)}
                value={fullname}
                id="name"
                type="text"
                placeholder="Entrez votre vrai nom et prénom"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input
                  onChange={e => setEmail(e.target.value)}
                  value={email}
                  id="email"
                  type="email"
                  placeholder="votre.email@exemple.com"
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  onChange={e => setPassword(e.target.value)}
                  value={password}
                  id="password"
                  type="password"
                  placeholder="Min. 8 caractères"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="city">Ville / Gouvernorat *</Label>
                <Input
                  id="city"
                  placeholder="Ex: Tunis, Sousse, Sfax..."
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="phone">Téléphone / WhatsApp {isTutor ? '*' : ''}</Label>
                <Input
                  id="phone"
                  placeholder="Ex: 22 000 000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required={isTutor}
                />
              </div>
            </div>

            {/* Student Categorization Section */}
            {!isTutor && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 space-y-3">
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-emerald-600" />
                  Votre Catégorie &amp; Niveau Scolaire
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="studentLevel" className="text-xs">
                      Cycle / Niveau d&apos;études *
                    </Label>
                    <select
                      id="studentLevel"
                      value={studentLevel}
                      onChange={e => handleLevelChange(e.target.value as StudentLevel)}
                      className="w-full h-9 rounded-md border border-input bg-white dark:bg-zinc-900 px-3 text-xs font-medium"
                      required
                    >
                      {STUDENT_LEVELS.map(lvl => (
                        <option key={lvl.value} value={lvl.value}>
                          {lvl.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="studentGrade" className="text-xs">
                      Classe / Année *
                    </Label>
                    <select
                      id="studentGrade"
                      value={studentGrade}
                      onChange={e => setStudentGrade(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-white dark:bg-zinc-900 px-3 text-xs font-medium"
                      required
                    >
                      {currentLevelObj.grades.map(g => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {needsSection && (
                    <div className="space-y-1">
                      <Label htmlFor="studentSection" className="text-xs">
                        Section Lycée / Bac *
                      </Label>
                      <select
                        id="studentSection"
                        value={studentSection}
                        onChange={e => setStudentSection(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-white dark:bg-zinc-900 px-3 text-xs font-medium"
                      >
                        {LYCEE_SECTIONS.map(sec => (
                          <option key={sec.value} value={sec.value}>
                            {sec.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className={cn('space-y-1', !needsSection && 'sm:col-span-2')}>
                    <Label htmlFor="institution" className="text-xs">
                      Établissement (École, Collège, Lycée ou Faculté)
                    </Label>
                    <Input
                      id="institution"
                      placeholder="Ex: Lycée Pilote Bourguiba, INSAT, IHEC..."
                      value={institution}
                      onChange={e => setInstitution(e.target.value)}
                      className="bg-white text-xs h-9"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tutor Complete Profile Section */}
            {isTutor && (
              <div className="rounded-xl border border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 space-y-3">
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  Dossier Complet du Professeur
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="specialty" className="text-xs">
                      Matière principale / Spécialité *
                    </Label>
                    <Input
                      id="specialty"
                      placeholder="Ex: Mathématiques, Physique, Anglais..."
                      value={specialty}
                      onChange={e => setSpecialty(e.target.value)}
                      required
                      className="bg-white text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="credentials" className="text-xs">
                      Diplômes &amp; Établissement *
                    </Label>
                    <Input
                      id="credentials"
                      placeholder="Ex: Professeur Agrégé, Ingénieur..."
                      value={credentials}
                      onChange={e => setCredentials(e.target.value)}
                      required
                      className="bg-white text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="experience" className="text-xs">
                      Années d&apos;expérience *
                    </Label>
                    <Input
                      id="experience"
                      placeholder="Ex: 5 ans d'enseignement lycée/prépa"
                      value={experience}
                      onChange={e => setExperience(e.target.value)}
                      required
                      className="bg-white text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="payoutMethod" className="text-xs">
                      Réception de vos paiements (85%) *
                    </Label>
                    <select
                      id="payoutMethod"
                      value={payoutMethod}
                      onChange={e => setPayoutMethod(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-white dark:bg-zinc-900 px-3 text-xs font-medium"
                    >
                      {PAYOUT_METHODS.map(pm => (
                        <option key={pm.value} value={pm.value}>
                          {pm.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="payoutAccount" className="text-xs">
                    Numéro D17 ou RIB bancaire/postal (pour recevoir vos paiements après évaluation élève) *
                  </Label>
                  <Input
                    id="payoutAccount"
                    placeholder="Ex: Numéro téléphone D17 (8 chiffres) ou RIB (20 chiffres)"
                    value={payoutAccount}
                    onChange={e => setPayoutAccount(e.target.value)}
                    required
                    className="bg-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="bio" className="text-xs">
                    Biographie complète, niveaux enseignés &amp; méthodologie *
                  </Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    placeholder="Présentez votre parcours, vos résultats avec les élèves et votre méthode de travail en ligne..."
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    required
                    className="bg-white text-xs"
                  />
                </div>
              </div>
            )}

            {/* Mandatory Terms & Conditions Checkbox */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                required
              />
              <span className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                J&apos;ai lu et j&apos;accepte les{' '}
                <Link
                  href={isTutor ? '/legal#professeurs' : '/legal#eleves'}
                  target="_blank"
                  className="font-bold text-emerald-700 dark:text-emerald-400 underline"
                >
                  Conditions Générales d&apos;Utilisation (CGU)
                </Link>{' '}
                de 9arrini : je comprends que 9arrini est une plateforme de mise en relation, que la{' '}
                <strong>1ère semaine de lancement est gratuite</strong>, qu&apos;une{' '}
                <strong>commission de 15%</strong> (85% reversés au professeur) s&apos;applique sur
                les séances payantes, et que le paiement du professeur est débloqué après
                l&apos;évaluation de la séance par l&apos;élève.
              </span>
            </label>

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
                'Créer mon Compte Élève'
              )}
            </Button>

            <div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-card px-2 text-muted-foreground">
                Ou connexion rapide
              </span>
            </div>

            <Button
              type="button"
              onClick={signUpWithGoogle}
              variant="outline"
              className="w-full h-10 font-semibold border-2 text-xs"
            >
              <IconBrandGoogle className="h-4 w-4 mr-2 text-emerald-600" />
              {isTutor
                ? 'Continuer avec Google (Compte Professeur)'
                : 'Continuer avec Google (Compte Élève)'}
            </Button>

            <div className="mt-2 text-center text-sm">
              Vous avez déjà un compte ?{' '}
              <a
                href="/auth/login"
                className="font-semibold text-emerald-700 underline underline-offset-4"
              >
                Se connecter
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
