import Link from 'next/link';
import {LEGAL_OPERATOR} from '@/lib/constants';

export const Footer = () => {
  return (
    <div className="border-t-2 p-6 mt-8 mb-1 bg-white/50 dark:bg-zinc-950/50">
      <div className="container flex flex-col gap-4 text-foreground lg:flex-row justify-between items-center">
        <div className="flex flex-col items-center lg:items-start gap-1">
          <div className="font-black text-xl text-emerald-600">
            9arrini<span className="text-foreground font-semibold">.tn</span> • قَرّيني
          </div>
          <div className="text-xs text-muted-foreground">
            Exploité par {LEGAL_OPERATOR.name} • Auto-Entrepreneur N° {LEGAL_OPERATOR.registration}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-medium text-muted-foreground">
          <Link href="/legal" className="hover:text-emerald-600 underline-offset-4 hover:underline">
            Conditions Générales (CGU)
          </Link>
          <span>•</span>
          <Link
            href="/legal#eleves"
            className="hover:text-emerald-600 underline-offset-4 hover:underline"
          >
            CGU Élèves
          </Link>
          <span>•</span>
          <Link
            href="/legal#professeurs"
            className="hover:text-emerald-600 underline-offset-4 hover:underline"
          >
            CGU Professeurs (15% Commission)
          </Link>
          <span>•</span>
          <Link
            href="/legal#confidentialite"
            className="hover:text-emerald-600 underline-offset-4 hover:underline"
          >
            Confidentialité
          </Link>
        </div>
        <div className="text-xs text-muted-foreground">
          © 9arrini — Plateforme de Mise en Relation Éducative en Tunisie 2026.
        </div>
      </div>
    </div>
  );
};
