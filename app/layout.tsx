import type {Metadata} from 'next';

import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import NextTopLoader from 'nextjs-toploader';
import {Toaster} from 'sonner';
import {LanguageProvider} from '@/lib/i18n';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '9arrini (قَرّيني) — Les Meilleurs Professeurs & Cours Particuliers en Tunisie',
  description:
    'Trouvez le professeur idéal, réservez vos séances de cours particuliers en ligne sur Google Meet et réussissez vos études avec 9arrini.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className="overflow-x-hidden max-w-[100vw] antialiased h-full max-h-[100svh]"
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full tracking-tighter `}
      >
        <NextTopLoader showSpinner={false} color="#0bf59e" />
        <LanguageProvider>{children}</LanguageProvider>
        <Toaster
          className="z-50"
          mobileOffset={20}
          expand
          closeButton
          containerAriaLabel="Notifications"
          position="bottom-right"
          richColors
        />
      </body>
    </html>
  );
}
