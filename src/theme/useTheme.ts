import { useContext } from 'react';

import { ThemeContext, type Theme } from './ThemeProvider';

/**
 * The only way a component reads a colour.
 *
 * Throwing rather than falling back to the light palette is deliberate: a
 * silent fallback would render a plausible-looking screen that ignores the
 * user's dark mode, and nobody would notice until a screenshot.
 */
export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (theme === null) {
    throw new Error('useTheme() outside a <ThemeProvider>. Wrap the tree in app/_layout.tsx.');
  }
  return theme;
}
