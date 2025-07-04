'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ClientTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
  };
  branding: {
    logo?: string;
    companyName: string;
    tagline?: string;
  };
  personality: {
    tone: 'professional' | 'friendly' | 'technical';
    formality: 'formal' | 'conversational';
  };
}

// Predefined demo themes
const DEMO_THEMES: ClientTheme[] = [
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    colors: {
      primary: '#0066cc',
      secondary: '#004499',
      accent: '#ff6b35',
      background: '#ffffff',
      foreground: '#1a1a1a',
      muted: '#f5f5f5',
      border: '#e0e0e0'
    },
    typography: {
      fontFamily: 'Inter',
      fontSize: { xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px' }
    },
    branding: {
      companyName: 'TechCorp Solutions',
      tagline: 'Innovative Benefits for the Modern Workforce'
    },
    personality: { tone: 'professional', formality: 'formal' }
  },
  {
    id: 'healthcare-green',
    name: 'Healthcare Green',
    colors: {
      primary: '#00a86b',
      secondary: '#008050',
      accent: '#ffa500',
      background: '#fafffe',
      foreground: '#2c2c2c',
      muted: '#f0f8f5',
      border: '#d0e6db'
    },
    typography: {
      fontFamily: 'Source Sans Pro',
      fontSize: { xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px' }
    },
    branding: {
      companyName: 'MedLife Partners',
      tagline: 'Comprehensive Care, Simplified'
    },
    personality: { tone: 'friendly', formality: 'conversational' }
  },
  {
    id: 'startup-purple',
    name: 'Startup Purple',
    colors: {
      primary: '#6366f1',
      secondary: '#4f46e5',
      accent: '#f59e0b',
      background: '#ffffff',
      foreground: '#111827',
      muted: '#f9fafb',
      border: '#e5e7eb'
    },
    typography: {
      fontFamily: 'Poppins',
      fontSize: { xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px' }
    },
    branding: {
      companyName: 'InnovateTech',
      tagline: 'Disrupting Benefits, One Employee at a Time'
    },
    personality: { tone: 'friendly', formality: 'conversational' }
  }
];

interface ThemeContextType {
  currentTheme: ClientTheme;
  setThemeById: (themeId: string) => void;
  availableThemes: ClientTheme[];
  updateCSSVariables: (theme: ClientTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ClientTheme>(DEMO_THEMES[0]);
  const [availableThemes] = useState<ClientTheme[]>(DEMO_THEMES);

  const updateCSSVariables = (theme: ClientTheme) => {
    const root = document.documentElement;
    
    // Update CSS custom properties
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-foreground', theme.colors.foreground);
    root.style.setProperty('--color-muted', theme.colors.muted);
    root.style.setProperty('--color-border', theme.colors.border);
    
    // Update typography
    root.style.setProperty('--font-family', theme.typography.fontFamily);
    Object.entries(theme.typography.fontSize).forEach(([size, value]) => {
      root.style.setProperty(`--font-size-${size}`, value);
    });
  };

  const setThemeById = (themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      updateCSSVariables(theme);
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentTheme', themeId);
      }
    }
  };

  useEffect(() => {
    // Load saved theme on mount
    if (typeof window !== 'undefined') {
      const savedThemeId = localStorage.getItem('currentTheme');
      if (savedThemeId) {
        const theme = availableThemes.find(t => t.id === savedThemeId);
        if (theme) {
          setCurrentTheme(theme);
          updateCSSVariables(theme);
        }
      } else {
        updateCSSVariables(currentTheme);
      }
    }
  }, [currentTheme, availableThemes]);

  return (
    <ThemeContext.Provider 
      value={{
        currentTheme, 
        setThemeById, 
        availableThemes, 
        updateCSSVariables 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}