import { createContext, useContext, useState, ReactNode } from 'react';

export interface Theme {
  id: string;
  name: string;
  colors: {
    bg: string;
    bgSecondary: string;
    border: string;
    text: string;
    textSecondary: string;
    primary: string;
    primaryHover: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'klipper',
    name: 'Klipper Orange',
    colors: {
      bg: '#1a1d24',
      bgSecondary: '#1e2228',
      border: '#2a2e37',
      text: '#ffffff',
      textSecondary: '#9ca3af',
      primary: '#f97316',
      primaryHover: '#ea580c',
      accent: '#fb923c',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    }
  },
  {
    id: 'mainsail',
    name: 'Mainsail Purple',
    colors: {
      bg: '#121212',
      bgSecondary: '#1e1e1e',
      border: '#2d2d2d',
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      primary: '#9c27b0',
      primaryHover: '#7b1fa2',
      accent: '#ba68c8',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
    }
  },
  {
    id: 'fluidd',
    name: 'Fluidd Blue',
    colors: {
      bg: '#0d1117',
      bgSecondary: '#161b22',
      border: '#30363d',
      text: '#ffffff',
      textSecondary: '#8b949e',
      primary: '#2196f3',
      primaryHover: '#1976d2',
      accent: '#64b5f6',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
    }
  },
  {
    id: 'octoprint',
    name: 'OctoPrint Green',
    colors: {
      bg: '#1a1a1a',
      bgSecondary: '#242424',
      border: '#333333',
      text: '#ffffff',
      textSecondary: '#999999',
      primary: '#00b894',
      primaryHover: '#00a383',
      accent: '#55efc4',
      success: '#00b894',
      warning: '#fdcb6e',
      error: '#d63031',
    }
  }
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(themes[0]);

  const setTheme = (themeId: string) => {
    const newTheme = themes.find(t => t.id === themeId);
    if (newTheme) {
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
