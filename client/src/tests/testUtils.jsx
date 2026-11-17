import { BrowserRouter } from 'react-router-dom';

export function TestProviders({ children }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}
