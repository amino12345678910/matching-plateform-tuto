'use client';

import {useState} from 'react';
import {submitTutorVerification} from '@/hooks/freelancers/verification-actions';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Badge} from '@/components/ui/badge';
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  Send,
  Award,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import {toast} from 'sonner';

export type TutorSellerInfo = {
  id: string;
  isVerified: boolean;
  verificationStatus: string;
  specialty: string | null;
  experience: string | null;
  credentials: string | null;
  phone: string | null;
  bio: string | null;
};

export function TutorVerificationBanner({seller}: {seller: TutorSellerInfo | null}) {
  const [status, setStatus] = useState(seller?.verificationStatus || 'UNVERIFIED');
  const [isVerified] = useState(Boolean(seller?.isVerified));
  const [showForm, setShowForm] = useState(!seller?.isVerified && status !== 'PENDING');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    specialty: seller?.specialty || '',
    credentials: seller?.credentials || '',
    experience: seller?.experience || '',
    phone: seller?.phone || '',
    bio: seller?.bio || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await submitTutorVerification(formData);
      if (res.success) {
        setStatus('PENDING');
        setShowForm(false);
        toast.success(res.message || 'Candidature envoyée pour vérification !');
      } else {
        toast.error(res.error || 'Veuillez vérifier vos informations');
      }
    } catch {
      toast.error('Erreur lors de l’envoi du dossier');
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">
                  Accès Complet Activé • Compte Professeur Vérifié par 9arrini
                </h3>
                <Badge className="bg-emerald-600 text-white text-[10px]">Vérifié ✓</Badge>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                Votre candidature a été validée par notre équipe. Vous disposez de l&apos;accès complet
                pour publier vos cours et recevoir des élèves.
              </p>
            </div>
          </div>
          {seller?.specialty && (
            <Badge variant="outline" className="border-emerald-300 text-emerald-800 bg-white">
              <Award className="h-3.5 w-3.5 mr-1 text-emerald-600" />
              {seller.specialty}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 space-y-4">
      <Card
        className={
          status === 'PENDING'
            ? 'border-2 border-amber-400 bg-amber-50/50'
            : 'border-2 border-amber-500 bg-gradient-to-r from-amber-50/80 to-emerald-50/40'
        }
      >
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-700 shrink-0 mt-0.5">
                {status === 'PENDING' ? (
                  <Clock className="h-6 w-6 text-amber-600" />
                ) : (
                  <Lock className="h-6 w-6 text-amber-600" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base sm:text-lg font-bold">
                    {status === 'PENDING'
                      ? '⏳ Candidature Professeur en cours de vérification par 9arrini'
                      : '🔒 Accès Professeur Restreint — Candidature Obligatoire'}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={
                      status === 'PENDING'
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                        : 'bg-white text-amber-900 border-amber-400 font-semibold'
                    }
                  >
                    {status === 'PENDING' ? 'En attente de validation Admin' : 'Candidature requise'}
                  </Badge>
                </div>
                <CardDescription className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {status === 'PENDING'
                    ? 'Votre dossier de candidature a bien été reçu ! L’accès complet à votre compte Professeur (création et publication de cours sur Explorer) sera automatiquement débloqué dès que notre administration aura vérifié et validé votre profil.'
                    : 'Contrairement aux comptes élèves, les comptes Professeurs doivent obligatoirement déposer une candidature et être vérifiés par l’équipe 9arrini avant d’obtenir l’accès complet pour publier des cours.'}
                </CardDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(!showForm)}
              className="text-xs shrink-0 border-amber-400 bg-white hover:bg-amber-50"
            >
              {showForm
                ? 'Masquer le formulaire'
                : status === 'PENDING'
                ? 'Voir / Modifier ma candidature'
                : 'Remplir ma candidature'}
            </Button>
          </div>

          {/* 3-Step Verification Progress Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 mt-3 border-t border-amber-200/80">
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-950">1. Compte créé</p>
                <p className="text-[11px] text-emerald-700">Inscription Professeur enregistrée</p>
              </div>
            </div>

            <div
              className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs ${
                status === 'PENDING'
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-amber-100/70 border-amber-300'
              }`}
            >
              {status === 'PENDING' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              )}
              <div>
                <p className="font-bold text-slate-900">2. Dossier de candidature</p>
                <p className="text-[11px] text-slate-600">
                  {status === 'PENDING'
                    ? 'Candidature envoyée ✓'
                    : 'À compléter ci-dessous'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/80 border border-slate-200 text-xs">
              <Lock className="h-4 w-4 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">3. Validation par 9arrini</p>
                <p className="text-[11px] text-slate-600">
                  Débloque l&apos;accès complet Professeur
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 pt-3 border-t border-amber-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="specialty">Matière principale & Spécialité *</Label>
                  <Input
                    id="specialty"
                    placeholder="Ex: Mathématiques & Analyse (Lycée, Bac & Prépa)"
                    value={formData.specialty}
                    onChange={e => setFormData({...formData, specialty: e.target.value})}
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="credentials">Diplôme / Titre académique *</Label>
                  <Input
                    id="credentials"
                    placeholder="Ex: Professeur Agrégé / Ingénieur diplômé / Master..."
                    value={formData.credentials}
                    onChange={e => setFormData({...formData, credentials: e.target.value})}
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="experience">Années d’expérience pédagogique *</Label>
                  <Input
                    id="experience"
                    placeholder="Ex: 5 ans d’expérience en cours particuliers & accompagnement Bac"
                    value={formData.experience}
                    onChange={e => setFormData({...formData, experience: e.target.value})}
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Numéro de téléphone / WhatsApp *</Label>
                  <Input
                    id="phone"
                    placeholder="Ex: +216 22 000 000"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    required
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio">Présentation & Méthodologie d’enseignement *</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  placeholder="Expliquez votre parcours, votre méthode de travail avec les élèves et les niveaux que vous accompagnez..."
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  required
                  className="bg-white"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {loading
                    ? 'Envoi en cours...'
                    : 'Envoyer ma candidature pour vérification par 9arrini'}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
