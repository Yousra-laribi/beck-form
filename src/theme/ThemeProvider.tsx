import { createContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { couleurs, type Couleurs, type Scheme } from './tokens';

export interface Theme {
  scheme: Scheme;
  c: Couleurs;
}

export const ThemeContext = createContext<Theme | null>(null);

export interface ThemeProviderProps {
  children: ReactNode;
  /**
   * Forces a scheme instead of following the system.
   *
   * There is no user-facing theme toggle: the mockup has none, and CLAUDE.md 4.4
   * says the theme follows `useColorScheme()`. This prop exists so the dev
   * gallery can put both themes on one screen — a nested provider, not a
   * setting. Nothing in `app/` outside the gallery passes it.
   */
  scheme?: Scheme;
}

export function ThemeProvider({ children, scheme }: ThemeProviderProps) {
  const systeme = useColorScheme();
  // `useColorScheme()` returns null before the native module answers. Light is
  // the mockup's default, so an unknown scheme resolves there rather than
  // flashing dark on first paint.
  const resolu: Scheme = scheme ?? (systeme === 'dark' ? 'dark' : 'light');

  const valeur = useMemo<Theme>(() => ({ scheme: resolu, c: couleurs[resolu] }), [resolu]);

  return <ThemeContext.Provider value={valeur}>{children}</ThemeContext.Provider>;
}
