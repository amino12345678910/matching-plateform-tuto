import type {Metadata} from 'next';

import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import NextTopLoader from 'nextjs-toploader';
import {Toaster} from 'sonner';

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
  title: '9arrini (قَرّيني) — A7san Profs & Drous fi Tounes',
  description: 'L9a el prof elli ywelemk, réservez des cours particuliers en ligne ou à domicile, w tfawwa9 fi 9raytek!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="overflow-x-hidden max-w-[100vw] antialiased h-full max-h-[100svh]"
    >
      {/* <head> */}
      {/* <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="352eab6a-a921-4d6b-b73c-3282f2a38d2f"
        /> */}
      {/* </head> */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full tracking-tighter `}
      >
        <NextTopLoader showSpinner={false} color="#0bf59e" />
        {children}
        <Toaster
          className="z-50"
          mobileOffset={20}
          expand
          closeButton
          containerAriaLabel="Message Box"
          position="bottom-right"
          richColors
          // theme={toasterTheme}
        />
      </body>
    </html>
  );
}
