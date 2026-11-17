import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CTASection({ title = 'Bring your projects and people together.', description = 'Discover a more coordinated way to deliver work with PTMS.' }) {
  return (
    <section className="public-cta">
      <div className="public-cta-orb public-cta-orb-one" aria-hidden="true" />
      <div className="public-cta-orb public-cta-orb-two" aria-hidden="true" />
      <div className="public-container public-cta-content">
        <div><span className="public-eyebrow public-eyebrow-light">Make progress together</span><h2>{title}</h2><p>{description}</p></div>
        <Link className="public-button public-button-white" to="/request-access">Request access <ArrowRight size={17} /></Link>
      </div>
    </section>
  );
}
