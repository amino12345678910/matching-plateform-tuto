import CreationSteps from '@/components/service/features/creation/creation-steps';
import {getTutorVerificationData} from '@/hooks/freelancers/verification-actions';
import {TutorVerificationBanner} from '@/components/freelancer/tutor-verification-banner';
import {Lock} from 'lucide-react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';

export const dynamic = 'force-dynamic';

async function page() {
  const sellerInfo = await getTutorVerificationData();
  const isVerified = Boolean(sellerInfo?.isVerified);

  if (!isVerified) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        <div className="rounded-2xl border-2 border-amber-400 bg-amber-50/60 p-6 text-center space-y-2">
          <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Publication de cours réservée aux Professeurs Vérifiés par 9arrini
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto">
            Vous devez d&apos;abord soumettre votre candidature Professeur ci-dessous et obtenir la
            validation de notre équipe avant de pouvoir publier un cours sur la plateforme.
          </p>
          <div className="pt-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/freelancer">Retour au Tableau de Bord Professeur</Link>
            </Button>
          </div>
        </div>

        <TutorVerificationBanner seller={sellerInfo} />
      </div>
    );
  }

  return (
    <div className="relative min-h-[84vh] w-full px-3">
      <CreationSteps />
    </div>
  );
}

export default page;
