import { ArrowRight, BriefcaseBusiness } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-container">
        <div className="public-footer-top">
          <div>
            <Link className="public-brand public-footer-brand" to="/">
              <span className="public-brand-mark"><BriefcaseBusiness size={20} aria-hidden="true" /></span>
              <span>PTMS<span className="public-brand-sub">PROJECT TEAM MANAGEMENT</span></span>
            </Link>
            <p className="public-footer-copy">A clearer way for organizations and teams to plan, collaborate, and deliver.</p>
          </div>
          <div className="public-footer-links">
            <span className="public-footer-label">Explore</span>
            <Link to="/about">About PTMS</Link><Link to="/features">Features</Link><Link to="/how-it-works">How it works</Link>
          </div>
          <div className="public-footer-links">
            <span className="public-footer-label">Get started</span>
            <Link to="/roles">User roles</Link><Link to="/request-access">Request access</Link><Link to="/contact">Contact</Link><Link to="/login">Sign in <ArrowRight size={14} /></Link>
          </div>
        </div>
        <div className="public-footer-bottom"><span>© {new Date().getFullYear()} PTMS. Built for better teamwork.</span><span>Secure, role-based workspace access</span></div>
      </div>
    </footer>
  );
}
