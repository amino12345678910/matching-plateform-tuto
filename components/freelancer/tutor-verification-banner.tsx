'use client';

import {useState} from 'react';
import {submitTutorVerification} from '@/hooks/freelancers/verification-actions';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Badge} from '@/components/ui/badge';
import {ShieldCheck, Clock, AlertTriangle, Send, Award} from 'lucide-react';
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
        toast.success(res.message || 'Dossier envoyé pour confirmation !');
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
                  Profil Professeur Vérifié • 9arrini Certified
                </h3>
                <Badge className="bg-emerald-600 text-white text-[10px]">Vérifié ✓</Badge>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                Votre statut a été confirmé par l’administration. Le badge officiel « Prof Vérifié »
                s’affiche sur tous vos cours pour rassurer les élèves.
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
    <div className="px-4 lg:px-6">
      <Card
        className={
          status === 'PENDING'
            ? 'border-amber-300 bg-amber-50/40'
            : 'border-amber-400 bg-gradient-to-r from-amber-50/70 to-emerald-50/40'
        }
      >
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              {status === 'PENDING' ? (
                <Clock className="h-5 w-5 text-amber-600 shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              )}
              <div>
                <CardTitle className="text-base sm:text-lg">
                  {status === 'PENDING'
                    ? '⏳ Confirmation Professeur en attente de validation Admin'
                    : '🛡️ Étape de Confirmation & Vérification du Compte Professeur'}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {status === 'PENDING'
                    ? 'Votre dossier pédagogique a bien été transmis. Un administrateur 9arrini va vérifier vos informations et activer votre badge « Prof Vérifié ✓ ».'
                    : 'Pour garantir la confiance des élèves sur 9arrini, complétez votre dossier pédagogique afin que l’administration confirme votre statut « Prof Vérifié ✓ ».'}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  status === 'PENDING'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-white text-amber-800 border-amber-300'
                }
              >
                {status === 'PENDING' ? 'En attente Admin' : 'Non vérifié'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(!showForm)}
                className="text-xs"
              >
                {showForm ? 'Masquer' : status === 'PENDING' ? 'Modifier mon dossier' : 'Compléter'}
              </Button>
            </div>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t">
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
                  <Label htmlFor="phone">Numéro de téléphone (Vérification Admin) *</Label>
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {loading
                    ? 'Envoi en cours...'
                    : 'Soumettre mon dossier pour confirmation Admin'}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
