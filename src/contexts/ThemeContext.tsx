'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme: nextTheme, setTheme: setNextTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Convert next-themes theme to our theme type
  const theme = (nextTheme as Theme) || 'system';
  const isDark = resolvedTheme === 'dark';

  // Handle theme changes
  const handleThemeChange = (newTheme: Theme) => {
    setNextTheme(newTheme);
  };

  // Toggle between light and dark (skip system)
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    handleThemeChange(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    setTheme: handleThemeChange,
    isDark,
    toggleTheme,
    mounted,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
