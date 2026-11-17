import { Suspense } from 'react';
import { AppProviders } from './providers/AppProviders.jsx';
import { AppRoutes } from './AppRoutes.jsx';

export default function App() {
  return (
    <AppProviders>
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">Loading page…</div>}>
        <AppRoutes />
      </Suspense>
    </AppProviders>
  );
}
