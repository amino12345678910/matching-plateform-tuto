import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {PlusCircle} from 'lucide-react';

export default function NoServicesFound() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center">
        <svg
          className="h-10 w-10 text-emerald-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 9V5.25m4.5 3.75V5.25M3.75 19.5h16.5m-1.5 0V11.25A2.25 2.25 0 0016.5 9h-9a2.25 2.25 0 00-2.25 2.25V19.5m3-10.5h6"
          />
        </svg>
      </div>

      <h2 className="mt-6 text-lg font-semibold text-foreground">
        Aucun cours publié pour le moment
      </h2>

      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        Tous les cours de démonstration ont été supprimés. Seuls les cours réels publiés par les professeurs inscrits s&apos;affichent ici.
      </p>

      <div className="mt-5">
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Link href="/dashboard/freelancer/create-service">
            <PlusCircle className="h-4 w-4 mr-2" />
            Publier un nouveau cours (Espace Prof)
          </Link>
        </Button>
      </div>
    </div>
  );
}
