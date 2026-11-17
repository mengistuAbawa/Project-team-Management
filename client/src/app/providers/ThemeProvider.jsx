import { useEffect, useMemo, useState } from 'react';
import { ThemeContext } from './ThemeContext.js';

export function ThemeProvider({ children }) {
  const [compact, setCompact] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('teamflow-theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('teamflow-theme', theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      compact,
      setCompact,
      theme,
      setTheme,
      toggleTheme: () => setTheme((currentTheme) => currentTheme === 'light' ? 'dark' : 'light'),
    }),
    [compact, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
