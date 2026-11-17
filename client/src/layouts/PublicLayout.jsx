import { Outlet } from 'react-router-dom';
import { PublicNavbar } from '../components/public/PublicNavbar.jsx';
import { PublicFooter } from '../components/public/PublicFooter.jsx';
import '../styles/public.css';

export function PublicLayout() {
  return (
    <div className="public-site">
      <a className="public-skip-link" href="#main-content">Skip to content</a>
      <PublicNavbar />
      <main id="main-content"><Outlet /></main>
      <PublicFooter />
    </div>
  );
}
