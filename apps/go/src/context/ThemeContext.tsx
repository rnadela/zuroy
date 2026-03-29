import { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HotelTheme {
  primary: string;
  secondary: string;
  logoUrl?: string;
  backgroundUrl?: string;
}

const DEFAULT_THEME: HotelTheme = { primary: '#1a56db', secondary: '#7c3aed' };

interface ThemeCtx {
  theme: HotelTheme;
  setTheme: (t: HotelTheme) => void;
}
const ThemeContext = createContext<ThemeCtx>({ theme: DEFAULT_THEME, setTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<HotelTheme>(DEFAULT_THEME);

  useEffect(() => {
    AsyncStorage.getItem('zuroy_theme').then((raw) => {
      if (raw) setThemeState(JSON.parse(raw));
    });
  }, []);

  const setTheme = (t: HotelTheme) => {
    setThemeState(t);
    AsyncStorage.setItem('zuroy_theme', JSON.stringify(t));
  };

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
