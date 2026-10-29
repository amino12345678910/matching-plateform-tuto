'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {
  Video,
  ExternalLink,
  Copy,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Calendar,
  ShieldCheck,
  ClipboardPaste,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
import {toast} from 'sonner';
import {getRoomMeetState, saveRoomGoogleMeetUrl} from '@/hooks/meet/meet-room-actions';

interface LiveClassroomClientProps {
  roomCode: string;
  initialGoogleMeetUrl: string | null;
  courseTitle: string;
  tutorName: string;
  scheduledLabel: string;
  userName: string;
  userEmail: string;
  userRole: string;
}

export function LiveClassroomClient({
  roomCode,
  initialGoogleMeetUrl,
  courseTitle,
  tutorName,
  scheduledLabel,
  userName,
  userEmail,
  userRole,
}: LiveClassroomClientProps) {
  const [googleMeetUrl, setGoogleMeetUrl] = useState<string | null>(initialGoogleMeetUrl);
  const [meetInput, setMeetInput] = useState(initialGoogleMeetUrl || '');
  const [saving, setSaving] = useState(false);
  const [showGooglePanel, setShowGooglePanel] = useState(
    userRole === 'SELLER' || userRole === 'ADMIN' || Boolean(initialGoogleMeetUrl)
  );

  const safeRoom = roomCode.replace(/[^a-zA-Z0-9_-]/g, '') || '9arriniLiveSession';
  const encodedName = encodeURIComponent(userName || 'Participant 9arrini');
  const encodedEmail = encodeURIComponent(userEmail || '');
  const jitsiIframeUrl = `https://meet.jit.si/${safeRoom}#userInfo.displayName="${encodedName}"&userInfo.email="${encodedEmail}"&config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false`;

  // Poll every 6s so students see when the tutor attaches a real Google Meet link
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const state = await getRoomMeetState(roomCode);
        if (state.googleMeetUrl && state.googleMeetUrl !== googleMeetUrl) {
          setGoogleMeetUrl(state.googleMeetUrl);
          setMeetInput(state.googleMeetUrl);
          toast.success('Le salon Google Meet officiel est prêt !');
        }
      } catch {
        // ignore
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [roomCode, googleMeetUrl]);

  const handleSaveGoogleMeet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await saveRoomGoogleMeetUrl({
        roomCode,
        googleMeetUrl: meetInput,
      });
      if (res.success && res.googleMeetUrl) {
        setGoogleMeetUrl(res.googleMeetUrl);
        setMeetInput(res.googleMeetUrl);
        toast.success('Vrai lien Google Meet activé et partagé avec votre élève !');
      } else {
        toast.error(res.error || 'Lien Google Meet invalide.');
      }
    } catch {
      toast.error('Erreur lors de la sauvegarde du lien Google Meet.');
    } finally {
      setSaving(false);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setMeetInput(text.trim());
        toast.success('Lien collé depuis le presse-papiers ! Cliquez sur Activer.');
      }
    } catch {
      toast.error('Collez votre lien Google Meet dans le champ ci-dessous (Ctrl+V).');
    }
  };

  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://www.9arrini.me/meet/${roomCode}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={userRole === 'SELLER' ? '/dashboard/freelancer' : '/dashboard/client/bookings'}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Tableau de bord
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <h1 className="text-sm sm:text-base font-bold text-white truncate">
                  {courseTitle}
                </h1>
                <Badge className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-[10px] hidden sm:inline-flex">
                  Salle Vidéo Directe 9arrini
                </Badge>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <Calendar className="h-3 w-3 text-emerald-400" />
                <span>{scheduledLabel}</span>
                <span>•</span>
                <span>Connecté en tant que : {userName}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(googleMeetUrl || shareUrl);
                toast.success('Lien de la séance copié !');
              }}
              className="h-8 text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Copier le lien
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowGooglePanel(!showGooglePanel)}
              className="h-8 text-xs border-emerald-500/40 bg-emerald-950/50 text-emerald-300 hover:bg-emerald-900/60 cursor-pointer"
            >
              <Video className="h-3.5 w-3.5 mr-1.5" />
              {googleMeetUrl ? 'Google Meet Officiel Actif' : 'Utiliser Google Meet Officiel'}
            </Button>
          </div>
        </div>
      </header>

      {/* Active Official Google Meet Banner (if attached) */}
      {googleMeetUrl && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/40 px-4 py-3">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-emerald-200">
                  Salon Google Meet officiel associé à cette séance :{' '}
                  <span className="font-mono underline">{googleMeetUrl}</span>
                </p>
                <p className="text-[11px] text-emerald-300/80">
                  Cliquez sur le bouton à droite pour rejoindre directement l&apos;appel sur Google
                  Meet, ou restez dans la salle vidéo intégrée ci-dessous.
                </p>
              </div>
            </div>
            <a
              href={googleMeetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm px-4 py-2 shadow-md transition shrink-0"
            >
              <Video className="h-4 w-4" />
              Rejoindre sur Google Meet
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Real Google Meet Creator / Linker Panel */}
      {showGooglePanel && (
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-3">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Créer et lier un vrai salon Google Meet officiel (en 2 clics)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Google Meet n&apos;accepte que les salons créés depuis votre compte Google. Cliquez
                sur <strong>1. Ouvrir meet.google.com/new</strong>, copiez l&apos;URL du salon créé,
                puis collez-la à l&apos;étape 2 pour votre élève.
              </p>
            </div>

            <form
              onSubmit={handleSaveGoogleMeet}
              className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0"
            >
              <a
                href="https://meet.google.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 shrink-0 transition"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                1. Ouvrir meet.google.com/new
              </a>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <Input
                  value={meetInput}
                  onChange={e => setMeetInput(e.target.value)}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  className="h-8 text-xs bg-slate-950 border-slate-700 text-white w-full sm:w-64 font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={pasteFromClipboard}
                  className="h-8 px-2 text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 shrink-0 cursor-pointer"
                  title="Coller"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold shrink-0 cursor-pointer"
                >
                  {saving ? 'Activation...' : '2. Activer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Live WebRTC Video Classroom */}
      <main className="flex-1 flex flex-col relative min-h-[calc(100vh-120px)]">
        <iframe
          src={jitsiIframeUrl}
          title={`Salle de cours en direct - ${courseTitle}`}
          allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-read; clipboard-write"
          className="w-full flex-1 border-0 min-h-[calc(100vh-120px)]"
        />
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 px-4 py-2 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          Salle de visioconférence chiffrée 9arrini — Audio, Vidéo HD, Partage d&apos;écran &amp;
          Tableau blanc intégrés.
        </span>
        <span>
          Après la séance, l&apos;élève confirme et note le professeur dans{' '}
          <Link href="/dashboard/client/bookings" className="text-emerald-400 underline">
            Mes Séances Réservées
          </Link>{' '}
          pour valider le paiement.
        </span>
      </footer>
    </div>
  );
}
