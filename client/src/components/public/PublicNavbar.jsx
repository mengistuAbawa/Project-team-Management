import { useState } from 'react';
import { BriefcaseBusiness, Menu, X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

const links = [
  ['Home', '/'],
  ['About', '/about'],
  ['Features', '/features'],
  ['How it works', '/how-it-works'],
  ['User roles', '/roles'],
  ['Contact', '/contact'],
];

export function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="public-nav">
      <div className="public-container public-nav-inner">
        <Link className="public-brand" to="/" aria-label="PTMS home" onClick={() => setOpen(false)}>
          <span className="public-brand-mark"><BriefcaseBusiness size={21} aria-hidden="true" /></span>
          <span>PTMS<span className="public-brand-sub">PROJECT TEAM MANAGEMENT</span></span>
        </Link>
        <button
          className="public-menu-toggle"
          type="button"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          aria-controls="public-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
        <nav id="public-navigation" className={`public-nav-links${open ? ' is-open' : ''}`} aria-label="Main navigation">
          {links.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => `public-nav-link${isActive ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          <div className="public-nav-actions">
            <Link to="/login" className="public-signin" onClick={() => setOpen(false)}>Sign in</Link>
            <Link to="/request-access" className="public-button public-button-small" onClick={() => setOpen(false)}>Get started</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
