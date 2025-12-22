'use client';

import {useTheme} from 'next-themes';
import {ThemeIcon} from './personal-icons';
import {Button} from './ui/button';
import {cn} from '@/lib/utils';

export function ModeToggle() {
  const {setTheme, theme} = useTheme();

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <Button
      type="button"
      onClick={() => toggleTheme()}
      className={cn('border-0 shadow-none')}
      size="sm"
      variant="outline"
    >
      <span className="sr-only">Toggle theme</span>
      <ThemeIcon />
    </Button>
  );
}
