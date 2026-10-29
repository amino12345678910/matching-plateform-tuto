'use client';
import {useState, useEffect} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Video,
  Calendar,
  Clock,
  Copy,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {cn} from '@/lib/utils';
import {RichEditor} from '@/components/editor/rich-editor';
import {
  generateMeetCode,
  getDefaultSessionDate,
  formatScheduleLabel,
  buildGoogleCalendarMeetUrl,
} from '@/lib/google-meet';
import {toast} from 'sonner';

const ACADEMIC_TEMPLATES = [
  {
    label: '📐 Math & Analyse (Bac / Lycée)',
    title: 'Cours particuliers en Mathématiques & Analyse — Préparation Bac, Devoirs & Concours',
    description: `<h3>🎯 Objectifs du cours</h3><p>Accompagnement personnalisé 1-on-1 en Mathématiques pour maîtriser les notions fondamentales, résoudre les exercices types d'examen et exceller aux devoirs de contrôle et de synthèse.</p><h3>📚 Programme & Méthodologie</h3><ul><li>Explication claire et simplifiée du cours avec astuces méthodologiques</li><li>Résolution guidée de séries d'exercices progressives et sujets de Bac</li><li>Correction détaillée des devoirs et suivi régulier de la progression</li></ul><h3>👨‍🎓 Pour qui ?</h3><p>Élèves du Lycée (1ère, 2ème, 3ème, Bac toutes sections) et étudiants universitaires cherchant un encadrement sérieux et structuré.</p>`,
  },
  {
    label: '💻 Python, Algo & Informatique',
    title: 'Formation pratique en Python, Algorithmique & Programmation — Du débutant au projet',
    description: `<h3>🎯 Objectifs du cours</h3><p>Apprendre à programmer proprement en Python et maîtriser l'algorithmique, les structures de données et le développement d'applications étape par étape.</p><h3>📚 Programme & Méthodologie</h3><ul><li>Apprentissage 100% pratique avec partage d'écran et exercices en direct</li><li>Correction de TP, préparation aux examens d'informatique et projets PFE</li><li>Support de cours PDF et code source commenté fournis après chaque séance</li></ul><h3>👨‍🎓 Pour qui ?</h3><p>Lycéens (Bac Info / Scientifique), étudiants en licence/cycle ingénieur et passionnés souhaitant progresser rapidement.</p>`,
  },
  {
    label: '🗣️ Anglais / Français & Langues',
    title: 'Coaching intensif en Langues (Oral, Écrit & Préparation IELTS / TCF / Bac)',
    description: `<h3>🎯 Objectifs du cours</h3><p>Développer une aisance réelle à l'oral comme à l'écrit, enrichir son vocabulaire académique et réussir ses examens ou certifications linguistiques.</p><h3>📚 Programme & Méthodologie</h3><ul><li>Pratique interactive de la conversation et correction de la prononciation</li><li>Méthodologie complète de rédaction (Essais, Synthèse, Expression écrite)</li><li>Simulations d'examens chronométrées avec feedback personnalisé</li></ul><h3>👨‍🎓 Pour qui ?</h3><p>Élèves, étudiants et professionnels souhaitant parler couramment et obtenir un excellent score.</p>`,
  },
  {
    label: '🔬 Physique, Chimie & Sciences',
    title: 'Cours de soutien en Physique & Chimie — Compréhension approfondie & Séries corrigées',
    description: `<h3>🎯 Objectifs du cours</h3><p>Comprendre les lois physiques et chimiques en profondeur et acquérir les bons réflexes de résolution d'exercices complexes.</p><h3>📚 Programme & Méthodologie</h3><ul><li>Rappel structuré des formules et théorèmes essentiels</li><li>Application directe sur des séries d'exercices ciblées</li><li>Préparation intensive aux devoirs surveillés et examens nationaux</li></ul><h3>👨‍🎓 Pour qui ?</h3><p>Élèves du secondaire, candidats au Bac et étudiants en classes préparatoires ou licence.</p>`,
  },
];

export function OverviewStep({
  register,
  errors,
  updateDescriptionValue,
  setValue,
  watch,
}: any) {
  const watchedTitle = watch ? watch('title') || '' : '';
  const watchedDescription = watch ? watch('description') || '' : '';
  const watchedDate = watch ? watch('scheduledDate') || getDefaultSessionDate(2) : getDefaultSessionDate(2);
  const watchedTime = watch ? watch('scheduledTime') || '18:00' : '18:00';
  const watchedMeetLink = watch ? watch('meetLink') || '' : '';

  const titleLength = watchedTitle.length;
  const wordCount = watchedTitle.trim().split(/\s+/).filter(Boolean).length;
  const descriptionLength = watchedDescription.replace(/<[^>]*>/g, '').trim().length;
  const [selectedLevel, setSelectedLevel] = useState('Bac & Lycée');
  const [autoGenerating, setAutoGenerating] = useState(false);

  const activeMeetDisplay = watchedMeetLink?.trim() || 'https://meet.google.com/new';

  const autoGenerateRealMeeting = async (showToast = false) => {
    setAutoGenerating(true);
    try {
      const res = await fetch('/api/meet/auto-create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          title: watchedTitle || 'Séance de cours particulier 9arrini',
          scheduledDate: watchedDate,
          scheduledTime: watchedTime,
        }),
      });
      const data = await res.json();
      if (data?.meetUrl && setValue) {
        setValue('meetLink', data.meetUrl, {shouldDirty: true});
        if (showToast) {
          toast.success(
            data.provider === 'GOOGLE_MEET_API'
              ? `Vrai salon Google Meet généré (${data.meetUrl}) !`
              : 'Lien Google Meet officiel (meet.google.com/new) prêt !'
          );
        }
      }
    } catch {
      if (setValue) {
        setValue('meetLink', 'https://meet.google.com/new', {shouldDirty: true});
      }
    } finally {
      setAutoGenerating(false);
    }
  };

  // Automatically generate a real meeting link and default date/time on first mount (zero copy-paste required)
  useEffect(() => {
    if (setValue && !watch?.('scheduledDate')) {
      setValue('scheduledDate', getDefaultSessionDate(2), {shouldDirty: true});
    }
    if (setValue && !watch?.('scheduledTime')) {
      setValue('scheduledTime', '18:00', {shouldDirty: true});
    }
    if (setValue && !watchedMeetLink) {
      autoGenerateRealMeeting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue]);

  const copyMeetLink = () => {
    navigator.clipboard.writeText(activeMeetDisplay);
    toast.success('Lien de la séance copié dans le presse-papiers !');
  };

  const calendarUrl = buildGoogleCalendarMeetUrl({
    title: watchedTitle || 'Séance de cours particulier 9arrini',
    meetUrl: activeMeetDisplay,
    dateStr: watchedDate,
    timeStr: watchedTime,
    durationMinutes: 60,
  });

  const handleDesValueChange = (description: string) => {
    updateDescriptionValue(description);
  };

  const applyTemplate = (tpl: (typeof ACADEMIC_TEMPLATES)[0]) => {
    if (setValue) {
      setValue('title', tpl.title, {shouldValidate: true, shouldDirty: true});
    }
    updateDescriptionValue(tpl.description);
  };

  return (
    <Card className="border-emerald-100">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              Présentation Structurée du Cours & Lien Google Meet
            </CardTitle>
            <CardDescription>
              Votre annonce inclut automatiquement un lien Google Meet prêt et planifié à la date de
              votre séance.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 w-fit">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
            Google Meet Auto-Généré
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* AUTOMATIC GOOGLE MEET GENERATOR & SCHEDULE BOX */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-emerald-50/70 to-teal-50/80 border-2 border-emerald-300/70 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Générateur Automatique Google Meet & Planification
                  <Badge className="bg-emerald-600 text-white text-[10px]">Prêt automatiquement</Badge>
                </h4>
                <p className="text-xs text-slate-600">
                  Choisissez la date et l’heure de la séance : le lien Google Meet est généré et
                  synchronisé automatiquement.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5 text-slate-800">
                <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                Date prévue de la séance *
              </Label>
              <Input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={watchedDate}
                onChange={e =>
                  setValue && setValue('scheduledDate', e.target.value, {shouldDirty: true})
                }
                className="bg-white border-emerald-200 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5 text-slate-800">
                <Clock className="h-3.5 w-3.5 text-emerald-600" />
                Heure de la séance (Tunisie) *
              </Label>
              <Input
                type="time"
                value={watchedTime}
                onChange={e =>
                  setValue && setValue('scheduledTime', e.target.value, {shouldDirty: true})
                }
                className="bg-white border-emerald-200 font-medium"
              />
            </div>
          </div>

          {/* 100% Automatic Real Video Meeting Link Box */}
          <div className="rounded-xl bg-white border border-emerald-200 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    Lien de visioconférence généré automatiquement pour :{' '}
                    <strong className="text-slate-900">
                      {formatScheduleLabel(watchedDate, watchedTime)}
                    </strong>
                  </span>
                </div>
                <p className="text-sm font-mono font-bold text-emerald-700 truncate">
                  {autoGenerating ? 'Génération automatique du salon vidéo...' : activeMeetDisplay}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyMeetLink}
                  className="h-8 text-xs border-emerald-200 hover:bg-emerald-50 cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copier
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={autoGenerating}
                  onClick={() => autoGenerateRealMeeting(true)}
                  className="h-8 text-xs border-emerald-200 hover:bg-emerald-50 cursor-pointer"
                >
                  <RefreshCw className={cn('h-3.5 w-3.5 mr-1', autoGenerating && 'animate-spin')} />
                  Nouveau salon auto
                </Button>
                <Button
                  type="button"
                  size="sm"
                  asChild
                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <a href={calendarUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    Google Agenda
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Academic Templates */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            Modèles Académiques Recommandés (Cliquez pour pré-remplir proprement)
          </div>
          <div className="flex flex-wrap gap-2">
            {ACADEMIC_TEMPLATES.map(tpl => (
              <Button
                key={tpl.label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyTemplate(tpl)}
                className="bg-white hover:bg-emerald-600 hover:text-white text-xs border-emerald-300 cursor-pointer transition-colors"
              >
                {tpl.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Target Level Selector */}
        <div className="space-y-2">
          <Label>Niveau d’études ciblé</Label>
          <div className="flex flex-wrap gap-2">
            {['Collège & Base', 'Bac & Lycée', 'Université & Prépa', 'Concours & Certifications'].map(
              lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer',
                    selectedLevel === lvl
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-background text-muted-foreground hover:border-emerald-400'
                  )}
                >
                  {lvl}
                </button>
              )
            )}
          </div>
        </div>

        {/* Service Title */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="title">Titre complet et professionnel du cours *</Label>
            <span
              className={cn(
                'text-xs font-medium',
                titleLength > 0 && (titleLength < 20 || wordCount < 4)
                  ? 'text-amber-600'
                  : titleLength >= 20 && wordCount >= 4
                  ? 'text-emerald-600'
                  : 'text-muted-foreground'
              )}
            >
              {wordCount} mots • {titleLength}/100 caractères (min. 4 mots requis)
            </span>
          </div>

          <div className="relative">
            <Input
              id="title"
              placeholder="Ex: Cours particuliers en Mathématiques & Analyse — Préparation Bac et Devoirs"
              {...register('title', {
                required: 'Le titre du cours est obligatoire',
                minLength: {
                  value: 20,
                  message:
                    'Le titre doit contenir au moins 20 caractères (évitez les titres courts d’un seul mot).',
                },
                maxLength: {
                  value: 100,
                  message: 'Le titre ne doit pas dépasser 100 caractères',
                },
                validate: (val: string) => {
                  const words = val.trim().split(/\s+/).filter(Boolean);
                  if (words.length < 4) {
                    return 'Veuillez écrire un titre complet d’au moins 4 mots (Matière + Niveau + Objectif).';
                  }
                  return true;
                },
              })}
              className={cn(
                'pr-10',
                errors.title
                  ? 'border-destructive'
                  : titleLength >= 20 && wordCount >= 4
                  ? 'border-emerald-400 focus-visible:ring-emerald-200'
                  : ''
              )}
            />

            {titleLength >= 20 && wordCount >= 4 && !errors.title && (
              <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500" />
            )}
          </div>

          {errors.title ? (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.title.message}</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Format exigé : <strong>[Matière enseignée] + [Niveau] + [Ce que l’élève va maîtriser]</strong>. Les titres d’un seul mot (ex: « math ») sont automatiquement refusés.
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">Programme détaillé & Méthodologie pédagogique *</Label>
            <span
              className={cn(
                'text-xs font-medium',
                descriptionLength > 0 && descriptionLength < 60
                  ? 'text-amber-600'
                  : descriptionLength >= 60
                  ? 'text-emerald-600'
                  : 'text-muted-foreground'
              )}
            >
              {descriptionLength} caractères rédigés (min. 60 caractères)
            </span>
          </div>

          <div className="relative">
            <RichEditor
              onChange={handleDesValueChange}
              placeholder="Détaillez les chapitres abordés, votre méthode d'explication, les exercices corrigés fournis et les niveaux accompagnés..."
            />

            {descriptionLength >= 60 && !errors.description && (
              <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-emerald-500" />
            )}
          </div>

          {errors.description ? (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.description.message}</span>
            </div>
          ) : (
            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">
                Votre description sera automatiquement mise en page selon le standard académique 9arrini :
              </p>
              <p>
                ✓ Objectifs du cours • ✓ Lien Google Meet automatique & Date • ✓ Supports PDF inclus.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
