import Link from 'next/link';
import {
  LEGAL_OPERATOR,
  PLATFORM_DOMAIN,
  PLATFORM_NAME,
  SUPPORT_EMAIL,
  TERMS_VERSION,
} from '@/lib/constants';
import {
  ShieldCheck,
  Scale,
  GraduationCap,
  BookOpen,
  Percent,
  Star,
  Lock,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

export const metadata = {
  title: `Conditions Générales d'Utilisation (CGU) & Mentions Légales — ${PLATFORM_NAME}`,
  description:
    'Conditions générales pour les élèves et les professeurs, rôle de mise en relation, commission de 15%, validation par avis après séance et mentions légales de 9arrini.',
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l&apos;accueil
          </Link>
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            Version en vigueur : {TERMS_VERSION}
          </span>
        </div>

        {/* Header */}
        <div className="rounded-3xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-3">
            <Scale className="w-3.5 h-3.5" />
            CADRE LÉGAL & TRANSPARENCE — TUNISIE
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Conditions Générales d&apos;Utilisation (CGU) &amp; Mentions Légales
          </h1>
          <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Bienvenue sur <strong>{PLATFORM_NAME}</strong> ({PLATFORM_DOMAIN}). Le présent contrat
            définit les règles applicables aux <strong>Élèves</strong> et aux{' '}
            <strong>Professeurs</strong>, le fonctionnement de notre plateforme de mise en relation,
            la garantie de paiement après évaluation de chaque séance ainsi que le détail de notre
            commission de service.
          </p>

          {/* Quick Jump Nav */}
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href="#mentions"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-emerald-100 text-zinc-700 hover:text-emerald-800 dark:bg-zinc-800 dark:text-zinc-200 transition"
            >
              1. Mentions Légales
            </a>
            <a
              href="#role"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-emerald-100 text-zinc-700 hover:text-emerald-800 dark:bg-zinc-800 dark:text-zinc-200 transition"
            >
              2. Rôle de Mise en Relation
            </a>
            <a
              href="#tarifs"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-emerald-100 text-zinc-700 hover:text-emerald-800 dark:bg-zinc-800 dark:text-zinc-200 transition"
            >
              3. Essai Gratuit 7 Jours &amp; Commission (15%)
            </a>
            <a
              href="#eleves"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-emerald-100 text-zinc-700 hover:text-emerald-800 dark:bg-zinc-800 dark:text-zinc-200 transition"
            >
              4. Conditions Élèves
            </a>
            <a
              href="#professeurs"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-emerald-100 text-zinc-700 hover:text-emerald-800 dark:bg-zinc-800 dark:text-zinc-200 transition"
            >
              5. Conditions Professeurs
            </a>
            <a
              href="#confidentialite"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-emerald-100 text-zinc-700 hover:text-emerald-800 dark:bg-zinc-800 dark:text-zinc-200 transition"
            >
              6. Confidentialité
            </a>
          </div>
        </div>

        {/* 1. Legal Identity */}
        <section
          id="mentions"
          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4 shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              1. Identité de l&apos;Exploitant &amp; Mentions Légales
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-zinc-200/70 dark:border-zinc-700">
            <div>
              <span className="text-zinc-500 block text-xs">Nom commercial &amp; Site web</span>
              <span className="font-bold text-zinc-900 dark:text-white">
                {PLATFORM_NAME} — https://{PLATFORM_DOMAIN}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-xs">Exploitant légal</span>
              <span className="font-bold text-zinc-900 dark:text-white">{LEGAL_OPERATOR.name}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-xs">Statut juridique</span>
              <span className="font-bold text-zinc-900 dark:text-white">
                {LEGAL_OPERATOR.status} (Régime Tunisien)
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-xs">
                N° d&apos;immatriculation Auto-Entrepreneur
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {LEGAL_OPERATOR.registration}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-xs">Compte D17 officiel</span>
              <span className="font-bold text-zinc-900 dark:text-white">
                {LEGAL_OPERATOR.d17} ({LEGAL_OPERATOR.name})
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-xs">Contact &amp; Réclamations</span>
              <span className="font-bold text-zinc-900 dark:text-white">{SUPPORT_EMAIL}</span>
            </div>
          </div>
        </section>

        {/* 2. Intermediary Matching Role */}
        <section
          id="role"
          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3 shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-emerald-600 shrink-0" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              2. Nature du Service : Plateforme de Mise en Relation
            </h2>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <strong>{PLATFORM_NAME}</strong> agit exclusivement en qualité{' '}
            <strong>d&apos;intermédiaire technologique de mise en relation</strong> entre des élèves
            (ou leurs parents/représentants légaux pour les mineurs) et des professeurs particuliers
            indépendants en Tunisie.
          </p>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Les professeurs inscrits sur {PLATFORM_NAME} ne sont pas salariés de la plateforme :
                ils exercent à titre indépendant et fixent librement leurs tarifs, créneaux horaires
                et méthodologies pédagogiques.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {PLATFORM_NAME} vérifie l&apos;exhaustivité des profils professeurs, facilite la
                réservation des séances en direct (Google Meet), assure le suivi administratif et
                sécurise le règlement des séances.
              </span>
            </li>
          </ul>
        </section>

        {/* 3. Free Trial, 15% Commission & Post-Session Rating Payout */}
        <section
          id="tarifs"
          className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 space-y-4 shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <Percent className="w-5 h-5 text-emerald-600 shrink-0" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              3. Semaine d&apos;Essai Gratuite, Commission (15%) &amp; Paiement après Évaluation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800">
              <div className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400">
                1. Semaine Gratuite (7 Jours)
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1.5 leading-relaxed">
                Durant la <strong>1ère semaine de lancement</strong>, l&apos;accès et la réservation
                des séances sont <strong>100 % gratuits (0 DT)</strong> pour tous les élèves et
                professeurs, sans aucun frais ni paiement requis.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800">
              <div className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400">
                2. Répartition 85 % / 15 %
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1.5 leading-relaxed">
                Pour les séances payantes après la période d&apos;essai :{' '}
                <strong>85 % du montant</strong> reviennent directement au professeur et{' '}
                <strong>15 % de commission</strong> sont retenus par {PLATFORM_NAME} (frais de
                plateforme, gestion et support).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800">
              <div className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                3. Déblocage après Avis Élève
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1.5 leading-relaxed">
                Le paiement du professeur est conservé en garantie et n&apos;est{' '}
                <strong>débloqué qu&apos;après la séance lorsque l&apos;élève note le cours</strong>{' '}
                (1 à 5 étoiles + commentaire) ou automatiquement après 72h sans litige.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Student Terms */}
        <section
          id="eleves"
          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3 shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-emerald-600 shrink-0" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              4. Conditions Spécifiques pour les Élèves &amp; Étudiants
            </h2>
          </div>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Catégorisation scolaire exacte :</strong> Lors de l&apos;inscription,
                l&apos;élève renseigne son niveau (Primaire, Collège, Lycée, Université/Prépa,
                Adulte), sa classe, sa section et sa ville afin d&apos;être orienté vers les cours
                adaptés. Pour les élèves mineurs, l&apos;inscription se fait sous la responsabilité
                du parent ou tuteur légal.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Évaluation obligatoire après chaque séance :</strong> Après avoir assisté au
                cours en direct sur Google Meet, l&apos;élève s&apos;engage à confirmer la tenue de
                la séance et à attribuer une note honnête (1 à 5 étoiles) au professeur afin de
                valider son paiement.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Signalement d&apos;absence ou problème :</strong> Si le professeur ne se
                présente pas à la séance ou en cas de problème majeur, l&apos;élève peut cliquer sur
                « Signaler un problème » depuis sa page « Mes Cours Réservés » pour bloquer le
                versement et demander l&apos;intervention de l&apos;administration.
              </span>
            </li>
          </ul>
        </section>

        {/* 5. Tutor Terms */}
        <section
          id="professeurs"
          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3 shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-emerald-600 shrink-0" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              5. Conditions Spécifiques pour les Professeurs (Tutors)
            </h2>
          </div>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Profil 100 % complet obligatoire :</strong> Tout professeur doit fournir son
                vrai nom, une photo de profil claire, une biographie détaillée, sa spécialité, ses
                diplômes/références, son numéro de téléphone tunisien valide ainsi que son moyen de
                réception des paiements (D17 ou RIB) avant validation par l&apos;administration.
                Aucun faux nom ni donnée fictive n&apos;est toléré.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Ponctualité &amp; Qualité des séances :</strong> Le professeur s&apos;engage
                à fournir un lien Google Meet valide, à respecter scrupuleusement la date et
                l&apos;heure programmées, et à assurer l&apos;intégralité de la séance réservée.
                Toute absence non justifiée entraîne l&apos;annulation du paiement et peut conduire
                à la suspension du compte.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Acceptation de la commission de 15 % :</strong> En publiant ses cours sur{' '}
                {PLATFORM_NAME}, le professeur accepte expressément la période d&apos;essai gratuite
                de lancement (7 jours) ainsi que la commission plateforme de <strong>15 %</strong>{' '}
                sur les séances payantes (soit <strong>85 % nets reversés au professeur</strong>{' '}
                après confirmation de la séance par l&apos;élève).
              </span>
            </li>
          </ul>
        </section>

        {/* 6. Privacy */}
        <section
          id="confidentialite"
          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3 shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              6. Protection des Données Personnelles &amp; Confidentialité
            </h2>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Conformément à la législation tunisienne sur la protection des données personnelles, les
            informations collectées lors de l&apos;inscription (nom, email, téléphone, niveau
            scolaire, diplômes) sont strictement utilisées pour le fonctionnement de{' '}
            <strong>{PLATFORM_NAME}</strong>, la mise en relation élève-professeur et le suivi des
            séances. Vos données ne sont jamais vendues à des tiers. Vous pouvez demander la
            modification ou la suppression de votre compte à tout moment en écrivant à{' '}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-emerald-600 font-semibold hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
