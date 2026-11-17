import { AuthProvider } from './AuthProvider.jsx';
import { ThemeProvider } from './ThemeProvider.jsx';

export function AppProviders({ children }) {
  return <ThemeProvider><AuthProvider>{children}</AuthProvider></ThemeProvider>;
}
