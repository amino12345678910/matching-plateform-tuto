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
  Camera,
} from 'lucide-react';
import {toast} from 'sonner';
import {PAYOUT_METHODS} from '@/lib/constants';

export type TutorSellerInfo = {
  id: string;
  isVerified: boolean;
  verificationStatus: string;
  specialty: string | null;
  experience: string | null;
  credentials: string | null;
  phone: string | null;
  city?: string | null;
  payoutMethod?: string | null;
  payoutAccount?: string | null;
  profilePhoto?: string | null;
  bio: string | null;
};

export function TutorVerificationBanner({seller}: {seller: TutorSellerInfo | null}) {
  const [status, setStatus] = useState(seller?.verificationStatus || 'UNVERIFIED');
  const [isVerified] = useState(Boolean(seller?.isVerified));
  const [showForm, setShowForm] = useState(!seller?.isVerified);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    specialty: seller?.specialty || '',
    credentials: seller?.credentials || '',
    experience: seller?.experience || '',
    phone: seller?.phone || '',
    city: seller?.city || '',
    payoutMethod: seller?.payoutMethod || 'D17',
    payoutAccount: seller?.payoutAccount || '',
    profilePhoto: seller?.profilePhoto || '',
    bio: seller?.bio || '',
  });

  const checks = [
    {label: 'Photo de profil', ok: Boolean(formData.profilePhoto.trim())},
    {label: 'Spécialité', ok: Boolean(formData.specialty.trim())},
    {label: 'Diplômes & références', ok: Boolean(formData.credentials.trim())},
    {label: 'Expérience', ok: Boolean(formData.experience.trim())},
    {label: 'Téléphone', ok: formData.phone.replace(/\D/g, '').length >= 8},
    {label: 'Ville', ok: Boolean(formData.city.trim())},
    {label: 'Compte D17 / RIB (85%)', ok: Boolean(formData.payoutAccount.trim())},
    {label: 'Biographie complète', ok: formData.bio.trim().length >= 30},
  ];
  const completedCount = checks.filter(c => c.ok).length;
  const completenessPct = Math.round((completedCount / checks.length) * 100);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1500000) {
      toast.error('Veuillez choisir une image de moins de 1.5 Mo.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setFormData(prev => ({...prev, profilePhoto: reader.result as string}));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (completenessPct < 100) {
      toast.error(
        'Votre profil professeur doit être complet à 100% (photo, bio, diplômes, téléphone, ville et compte D17/RIB).'
      );
      return;
    }
    setLoading(true);
    try {
      const res = await submitTutorVerification(formData);
      if (res.success) {
        setStatus('PENDING');
        setShowForm(false);
        toast.success(res.message || 'Profil complet envoyé pour vérification !');
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
                  Profil Complet &amp; Vérifié • Accès Professeur Actif
                </h3>
                <Badge className="bg-emerald-600 text-white text-[10px]">Vérifié ✓</Badge>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                Votre profil est validé. Vos séances payantes vous reversent 85 % du tarif dès
                confirmation et note de l&apos;élève après chaque cours (15 % commission 9arrini).
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
                      ? `⏳ Dossier Professeur en cours de vérification (${completenessPct}% complet)`
                      : `🔒 Profil Professeur 100% Complet Obligatoire (${completenessPct}%)`}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-900 border-amber-300 font-semibold"
                  >
                    {completenessPct}% complété
                  </Badge>
                </div>
                <CardDescription className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  Pour garantir une plateforme fiable, chaque professeur doit avoir un profil{' '}
                  <strong>100 % complet</strong> (photo réelle, biographie, diplômes, spécialité,
                  téléphone, ville et compte D17/RIB pour recevoir 85 % du tarif des séances après
                  évaluation de l&apos;élève).
                </CardDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(!showForm)}
              className="text-xs shrink-0 border-amber-400 bg-white hover:bg-amber-50"
            >
              {showForm ? 'Masquer le formulaire' : 'Compléter / Modifier mon profil'}
            </Button>
          </div>

          {/* Checklist pills */}
          <div className="flex flex-wrap gap-1.5 pt-3">
            {checks.map(c => (
              <span
                key={c.label}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                  c.ok
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-white text-amber-900 border-amber-300'
                }`}
              >
                {c.ok ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                )}
                {c.label}
              </span>
            ))}
          </div>
        </CardHeader>

        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 pt-3 border-t border-amber-200">
              {/* Photo Upload */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 rounded-xl bg-white border border-amber-200">
                <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-emerald-500 bg-zinc-100 flex items-center justify-center shrink-0">
                  {formData.profilePhoto ? (
                    <img
                      src={formData.profilePhoto}
                      alt="Photo professeur"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera className="h-6 w-6 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs font-bold">
                    Photo de profil réelle du professeur *
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="text-xs bg-white"
                    />
                    <Input
                      placeholder="Ou collez le lien URL de votre photo..."
                      value={
                        formData.profilePhoto.startsWith('data:') ? '' : formData.profilePhoto
                      }
                      onChange={e => setFormData({...formData, profilePhoto: e.target.value})}
                      className="text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="specialty">Matière principale &amp; Spécialité *</Label>
                  <Input
                    id="specialty"
                    placeholder="Ex: Mathématiques & Physique (Lycée, Bac & Prépa)"
                    value={formData.specialty}
                    onChange={e => setFormData({...formData, specialty: e.target.value})}
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="credentials">Diplômes &amp; Établissement *</Label>
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
                  <Label htmlFor="experience">Années d&apos;expérience *</Label>
                  <Input
                    id="experience"
                    placeholder="Ex: 5 ans d'enseignement"
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
                    placeholder="Ex: 22 000 000"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">Ville / Gouvernorat *</Label>
                  <Input
                    id="city"
                    placeholder="Ex: Tunis, Sousse, Sfax..."
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="payoutAccount">
                    Compte D17 ou RIB (pour recevoir vos 85% après avis élève) *
                  </Label>
                  <div className="flex gap-2">
                    <select
                      value={formData.payoutMethod}
                      onChange={e => setFormData({...formData, payoutMethod: e.target.value})}
                      className="h-9 rounded-md border border-input bg-white px-2 text-xs font-semibold"
                    >
                      {PAYOUT_METHODS.map(pm => (
                        <option key={pm.value} value={pm.value}>
                          {pm.value}
                        </option>
                      ))}
                    </select>
                    <Input
                      id="payoutAccount"
                      placeholder="Numéro D17 ou RIB"
                      value={formData.payoutAccount}
                      onChange={e => setFormData({...formData, payoutAccount: e.target.value})}
                      required
                      className="bg-white flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio">
                  Biographie complète, niveaux enseignés &amp; méthodologie (min. 30 caractères) *
                </Label>
                <Textarea
                  id="bio"
                  rows={3}
                  placeholder="Décrivez votre parcours, votre méthodologie et les classes que vous accompagnez..."
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
                    ? 'Enregistrement...'
                    : `Enregistrer mon profil complet (${completenessPct}%)`}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
