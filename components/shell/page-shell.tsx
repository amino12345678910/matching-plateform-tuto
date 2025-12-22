'use client';

import {ThemeProvider} from 'next-themes';
import type React from 'react';
import {Toaster} from 'sonner';

function PageShell({children}: {children: React.ReactNode}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
      <Toaster
        className="z-50"
        mobileOffset={20}
        expand
        closeButton
        containerAriaLabel="Message Box"
        position="bottom-center"
        richColors
        // theme={toasterTheme}
      />
    </ThemeProvider>
  );
}

export default PageShell;
