'use client';

import {useState, useEffect} from 'react';
import Image from 'next/image';
import {toast} from 'sonner';
import {cloudSignIn, cloudSignUp} from '@/hooks/auth/cloud-auth';
import {
  IconArrowLeft,
  IconMail,
  IconCheck,
  IconLoader,
  IconBrandGoogle,
  IconEye,
  IconEyeOff,
} from '@tabler/icons-react';
import {GraduationCap, ShieldCheck, BookOpen, Clock, CheckCircle2} from 'lucide-react';

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
import {Textarea} from '@/components/ui/textarea';
import {Badge} from '@/components/ui/badge';

const girlImage = '/assets/standard.0638957.png';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'USER' | 'SELLER';
  initialStep?: 'signup' | 'login';
}

export default function AuthModal({
  isOpen,
  onClose,
  initialRole = 'USER',
  initialStep = 'signup',
}: AuthModalProps) {
  const [step, setStep] = useState<'signup' | 'login'>(initialStep);
  const [accountType, setAccountType] = useState<'USER' | 'SELLER'>(initialRole);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const [regForm, setRegForm] = useState({
    username: '',
    email: '',
    password: '',
    specialty: '',
    credentials: '',
    experience: '',
    phone: '',
    bio: '',
  });

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAccountType(initialRole);
      setStep(initialStep);
      setShowEmailForm(false);
    }
  }, [isOpen, initialRole, initialStep]);

  const handleGoogleContinue = () => {
    onClose();
    window.location.href = `/api/auth/google?role=${encodeURIComponent(accountType)}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accountType === 'SELLER') {
      if (!regForm.specialty.trim() || !regForm.credentials.trim() || !regForm.phone.trim()) {
        toast.error(
          'Veuillez renseigner votre matière, votre diplôme et votre numéro de téléphone pour votre candidature Professeur.'
        );
        return;
      }
    }

    setLoading(true);
    try {
      const res = await cloudSignUp({
        name: regForm.username,
        email: regForm.email,
        password: regForm.password,
        role: accountType,
        specialty: accountType === 'SELLER' ? regForm.specialty : undefined,
        credentials: accountType === 'SELLER' ? regForm.credentials : undefined,
        experience: accountType === 'SELLER' ? regForm.experience : undefined,
        phone: accountType === 'SELLER' ? regForm.phone : undefined,
        bio: accountType === 'SELLER' ? regForm.bio : undefined,
      });

      if (res.success) {
        if (accountType === 'SELLER') {
          toast.success(
            'Candidature Professeur envoyée ! Votre compte sera pleinement activé après vérification par 9arrini.'
          );
        } else {
          toast.success('Compte Élève créé avec succès ! (+50 Points = 50 DT offerts)');
        }
        const targetUrl =
          res.redirectTo ||
          (accountType === 'SELLER' ? '/dashboard/freelancer' : '/dashboard/client');
        setLoading(false);
        onClose();
        window.location.href = targetUrl;
        return;
      } else {
        toast.error(res.error || 'Impossible de créer le compte.');
        setLoading(false);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Erreur lors de l’inscription');
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await cloudSignIn({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (res.success) {
        toast.success('Connexion réussie ! Mar7bé bik fi 9arrini');
        onClose();
        setLoginForm({email: '', password: ''});
        setLoading(false);
        window.location.href =
          res.redirectTo ||
          (accountType === 'SELLER' ? '/dashboard/freelancer' : '/dashboard/client');
        return;
      } else {
        toast.error(res.error || 'Identifiants incorrects');
        setLoading(false);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Erreur de connexion');
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setShowEmailForm(false);
    }
    onClose();
  };

  const isTutor = accountType === 'SELLER';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 max-h-[90vh] overflow-hidden">
        <div className="grid lg:grid-cols-12 h-full max-h-[90vh]">
          {/* Left Side Banner */}
          <div className="hidden lg:flex lg:col-span-5 relative bg-emerald-950 text-white flex-col justify-between p-8 overflow-hidden">
            <Image
              src={girlImage}
              alt="9arrini Academy"
              fill
              className="object-cover opacity-35"
              priority
            />
            <div className="relative z-10 space-y-4">
              <Badge className="bg-emerald-500 text-white text-xs font-bold px-3 py-1">
                9arrini • قَرّيني
              </Badge>
              <h2 className="text-2xl font-extrabold leading-tight">
                {isTutor
                  ? 'Rejoignez le corps professoral vérifié 9arrini'
                  : 'Apprenez avec des professeurs vérifiés en Tunisie'}
              </h2>
              <p className="text-xs text-emerald-100 leading-relaxed">
                {isTutor
                  ? 'Chaque candidature Professeur est examinée et validée par notre équipe académique afin de garantir l’excellence pédagogique aux élèves.'
                  : 'Réservez vos séances 1-on-1, payez avec votre solde Points (1 Pt = 1 DT) et accédez directement à vos cours Google Meet.'}
              </p>
            </div>

            <div className="relative z-10 space-y-2.5 bg-black/45 backdrop-blur-xs p-4 rounded-xl border border-white/15 text-xs">
              {isTutor ? (
                <>
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    Processus d&apos;accès Professeur :
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-emerald-400">1.</span>
                    <span>Création du compte & dépôt de votre candidature (diplômes, spécialité).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-emerald-400">2.</span>
                    <span>Vérification de votre profil par l&apos;administration 9arrini.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-emerald-400">3.</span>
                    <span>Déblocage de l&apos;accès complet Professeur Vérifié & publication de cours.</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4" />
                    Avantages Compte Élève :
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Accès immédiat à tous les cours et professeurs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>50 Points (50 DT) offerts à l&apos;inscription</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Liens Google Meet, rappels & contact WhatsApp</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Side Content */}
          <div className="lg:col-span-7 overflow-y-auto p-6 sm:p-8 max-h-[90vh]">
            {showEmailForm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmailForm(false)}
                className="mb-3 -ml-2 text-xs"
              >
                <IconArrowLeft className="h-4 w-4 mr-1.5" />
                Retour au choix de connexion
              </Button>
            )}

            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl sm:text-2xl font-bold">
                {step === 'signup'
                  ? isTutor
                    ? 'Candidature & Inscription Professeur'
                    : 'Créer un Compte Élève'
                  : isTutor
                  ? 'Connexion Espace Professeur'
                  : 'Connexion Espace Élève'}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {step === 'signup' ? (
                  <>
                    Vous avez déjà un compte ?{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto font-semibold text-emerald-700"
                      onClick={() => {
                        setStep('login');
                        setShowEmailForm(false);
                      }}
                    >
                      Se connecter
                    </Button>
                  </>
                ) : (
                  <>
                    Pas encore de compte ?{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto font-semibold text-emerald-700"
                      onClick={() => {
                        setStep('signup');
                        setShowEmailForm(false);
                      }}
                    >
                      S&apos;inscrire ou postuler comme Prof
                    </Button>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            {/* ================= PROMINENT ACCOUNT TYPE SEPARATION ================= */}
            <div className="mb-5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                Choisissez votre type de compte :
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType('USER')}
                  className={`flex flex-col items-start p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    accountType === 'USER'
                      ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-sm'
                      : 'border-border hover:border-emerald-300 bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-foreground">
                      <GraduationCap className="h-4 w-4 text-emerald-600" />
                      Compte Élève
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0"
                    >
                      Accès direct
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Réserver des cours, payer en Points et rejoindre Google Meet.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType('SELLER')}
                  className={`flex flex-col items-start p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    accountType === 'SELLER'
                      ? 'border-amber-600 bg-amber-50/80 dark:bg-amber-950/40 shadow-sm'
                      : 'border-border hover:border-amber-300 bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-foreground">
                      <BookOpen className="h-4 w-4 text-amber-600" />
                      Compte Professeur
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] border-amber-500/40 bg-amber-100 text-amber-900 px-1.5 py-0"
                    >
                      Sur candidature
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Postuler pour enseigner (accès complet après vérification 9arrini).
                  </p>
                </button>
              </div>
            </div>

            {/* Tutor Verification Distinction Notice */}
            {isTutor && (
              <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50/90 dark:bg-amber-950/30 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                  <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Candidature soumise à validation par l&apos;équipe 9arrini</span>
                </div>
                <p className="text-[11px] text-amber-900/85 dark:text-amber-200/80 leading-relaxed">
                  Pour garantir la qualité des cours sur 9arrini, les comptes Professeurs doivent{' '}
                  <strong>déposer une candidature pédagogique</strong>. Votre compte sera créé en mode{' '}
                  <em>Candidature en attente</em> et vous obtiendrez l&apos;<strong>accès complet Professeur Vérifié ✓</strong>{' '}
                  (publication de cours et réception d&apos;élèves) dès validation de votre dossier par notre administration.
                </p>
              </div>
            )}

            {!showEmailForm ? (
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 font-semibold border-2 hover:bg-slate-50"
                  onClick={handleGoogleContinue}
                >
                  <IconBrandGoogle className="h-5 w-5 mr-2 text-emerald-600" />
                  {step === 'signup'
                    ? isTutor
                      ? 'Postuler avec Google (Compte Professeur)'
                      : 'S’inscrire avec Google (Compte Élève)'
                    : isTutor
                    ? 'Se connecter avec Google (Professeur)'
                    : 'Se connecter avec Google (Élève)'}
                </Button>

                <Button
                  type="button"
                  className={`w-full h-12 font-semibold text-white ${
                    isTutor
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                  onClick={() => setShowEmailForm(true)}
                >
                  <IconMail className="h-5 w-5 mr-2" />
                  {step === 'signup'
                    ? isTutor
                      ? 'Remplir le dossier de candidature par Email'
                      : 'S’inscrire avec Email (Compte Élève)'
                    : 'Se connecter avec Email & Mot de passe'}
                </Button>
              </div>
            ) : step === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="modal-login-email">Email</Label>
                  <Input
                    id="modal-login-email"
                    type="email"
                    placeholder="votre.email@exemple.com"
                    value={loginForm.email}
                    onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="modal-login-password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="modal-login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Votre mot de passe"
                      value={loginForm.password}
                      onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <IconEyeOff className="h-4 w-4" />
                      ) : (
                        <IconEye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  disabled={loading}
                >
                  {loading && <IconLoader className="h-4 w-4 mr-2 animate-spin" />}
                  Se connecter ({isTutor ? 'Espace Professeur' : 'Espace Élève'})
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="reg-name" className="text-xs">
                      Nom complet *
                    </Label>
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder={isTutor ? 'Ex: Prof. Yassine Ben Ali' : 'Votre nom et prénom'}
                      value={regForm.username}
                      onChange={e => setRegForm({...regForm, username: e.target.value})}
                      required
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-email" className="text-xs">
                      Adresse Email *
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="email@exemple.com"
                      value={regForm.email}
                      onChange={e => setRegForm({...regForm, email: e.target.value})}
                      required
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="reg-password" className="text-xs">
                    Mot de passe *
                  </Label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Créer un mot de passe (min. 6 caractères)"
                      value={regForm.password}
                      onChange={e => setRegForm({...regForm, password: e.target.value})}
                      required
                      className="h-9 text-xs"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <IconEyeOff className="h-4 w-4" />
                      ) : (
                        <IconEye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Extra Mandatory Application Fields when registering as a Tutor */}
                {isTutor && (
                  <div className="rounded-xl border border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 space-y-3">
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-amber-600" />
                      Dossier de Candidature Professeur (Vérifié par 9arrini)
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <Label htmlFor="reg-specialty" className="text-[11px]">
                          Matière / Spécialité enseignée *
                        </Label>
                        <Input
                          id="reg-specialty"
                          placeholder="Ex: Mathématiques, Python, Physique..."
                          value={regForm.specialty}
                          onChange={e => setRegForm({...regForm, specialty: e.target.value})}
                          required
                          className="h-8 text-xs bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="reg-credentials" className="text-[11px]">
                          Diplôme / Titre académique *
                        </Label>
                        <Input
                          id="reg-credentials"
                          placeholder="Ex: Professeur Agrégé, Ingénieur, Master..."
                          value={regForm.credentials}
                          onChange={e => setRegForm({...regForm, credentials: e.target.value})}
                          required
                          className="h-8 text-xs bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="reg-exp" className="text-[11px]">
                          Années d&apos;expérience *
                        </Label>
                        <Input
                          id="reg-exp"
                          placeholder="Ex: 5 ans d'enseignement"
                          value={regForm.experience}
                          onChange={e => setRegForm({...regForm, experience: e.target.value})}
                          required
                          className="h-8 text-xs bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="reg-phone" className="text-[11px]">
                          Téléphone / WhatsApp *
                        </Label>
                        <Input
                          id="reg-phone"
                          placeholder="Ex: +216 22 000 000"
                          value={regForm.phone}
                          onChange={e => setRegForm({...regForm, phone: e.target.value})}
                          required
                          className="h-8 text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="reg-bio" className="text-[11px]">
                        Présentation & Méthodologie *
                      </Label>
                      <Textarea
                        id="reg-bio"
                        rows={2}
                        placeholder="Décrivez votre parcours et les niveaux que vous accompagnez..."
                        value={regForm.bio}
                        onChange={e => setRegForm({...regForm, bio: e.target.value})}
                        required
                        className="text-xs bg-white"
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className={`w-full h-11 font-bold text-white ${
                    isTutor
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                  disabled={loading}
                >
                  {loading && <IconLoader className="h-4 w-4 mr-2 animate-spin" />}
                  {isTutor
                    ? 'Soumettre ma Candidature Professeur'
                    : 'Créer mon Compte Élève (+50 Pts offerts)'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
