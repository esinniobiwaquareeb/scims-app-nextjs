'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { 
  Sun, 
  Moon
} from 'lucide-react';
import { cn } from '@/components/ui/utils';

export const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme, mounted } = useTheme();

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="fixed top-1/2 right-6 -translate-y-1/2 z-50">
        <Button
          size="icon"
          className={cn(
            "h-12 w-12 rounded-full shadow-lg transition-transform duration-300",
            "bg-background border border-border hover:scale-110",
            "dark:bg-background dark:border-border"
          )}
        >
          <div className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-1/2 right-6 -translate-y-1/2 z-50">
      <Button
        onClick={toggleTheme}
        size="icon"
        className={cn(
          "h-12 w-12 rounded-full shadow-lg transition-transform duration-300",
          "bg-background border border-border hover:scale-110",
          "dark:bg-background dark:border-border"
        )}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-yellow-500" />
        ) : (
          <Moon className="h-5 w-5 text-slate-600" />
        )}
      </Button>
    </div>
  );
};
