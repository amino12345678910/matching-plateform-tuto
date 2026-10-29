'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import {Separator} from '@/components/ui/separator';
import {Skeleton} from '@/components/ui/skeleton';
import {Badge} from '@/components/ui/badge';
import {getUserInfo} from '@/hooks/shared/get-user-info';
import {getTutorVerificationData} from '@/hooks/freelancers/verification-actions';
import {TutorVerificationBanner} from '@/components/freelancer/tutor-verification-banner';
import {profilePhoto} from '@/components/profile-url';
import {getLevelLabel, getGradeLabel, getSectionLabel} from '@/lib/constants';
import {GraduationCap, ShieldCheck, MapPin, Phone, Scale} from 'lucide-react';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [avatar, setAvatar] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const u = await getUserInfo();
      setUser(u);

      if (u?.role === 'SELLER') {
        const s = await getTutorVerificationData();
        setSeller(s);
      }

      const img = await profilePhoto({
        imageSource: u?.imageSource as any,
        imageUrl: u?.image,
      });
      setAvatar(img);
      setLoading(false);
    };
    init();
  }, []);

  if (loading || !user)
    return (
      <div className="max-w-3xl p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );

  const isFreelancer = user.role === 'SELLER';

  return (
    <div className="max-w-4xl px-4 sm:px-8 py-8 space-y-8">
      <section className="flex flex-col sm:flex-row sm:items-center gap-5 p-6 rounded-2xl border bg-card shadow-xs">
        <div className="relative h-20 w-20 shrink-0">
          <Image
            src={seller?.profilePhoto || user.image || avatar || '/avatar.png'}
            alt="Photo de profil"
            fill
            className="rounded-full object-cover border-2 border-emerald-500"
          />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold">{user.name}</h1>
            <Badge className={isFreelancer ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'}>
              {isFreelancer ? 'Compte Professeur' : 'Compte Élève'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
            {(user.city || seller?.city) && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                {user.city || seller?.city}
              </span>
            )}
            {(user.phone || seller?.phone) && (
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                {user.phone || seller?.phone}
              </span>
            )}
          </div>
        </div>
      </section>

      {isFreelancer ? (
        <div className="-mx-4 lg:-mx-6">
          <TutorVerificationBanner seller={seller} />
        </div>
      ) : (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-bold">Ma Catégorie &amp; Fiche Scolaire Élève</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border">
              <span className="text-xs text-muted-foreground block">Cycle / Niveau</span>
              <span className="font-bold">{getLevelLabel(user.studentLevel)}</span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border">
              <span className="text-xs text-muted-foreground block">Classe</span>
              <span className="font-bold">{getGradeLabel(user.studentGrade)}</span>
            </div>
            {user.studentSection && (
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border">
                <span className="text-xs text-muted-foreground block">Section</span>
                <span className="font-bold">{getSectionLabel(user.studentSection)}</span>
              </div>
            )}
            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border">
              <span className="text-xs text-muted-foreground block">Établissement / Ville</span>
              <span className="font-bold">
                {user.institution || user.city || 'Non renseigné'}
              </span>
            </div>
          </div>
        </section>
      )}

      <Separator />

      <section className="rounded-2xl border p-5 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Scale className="h-4 w-4 text-emerald-600" />
            Conditions Générales d&apos;Utilisation (CGU) &amp; Transparence
          </div>
          <p className="text-xs text-muted-foreground">
            Rôle de mise en relation 9arrini, semaine de lancement gratuite, commission de 15 %
            (85 % prof) et déblocage après évaluation élève.
          </p>
        </div>
        <Link
          href="/legal"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0"
        >
          <ShieldCheck className="h-4 w-4" />
          Consulter les CGU
        </Link>
      </section>
    </div>
  );
}
