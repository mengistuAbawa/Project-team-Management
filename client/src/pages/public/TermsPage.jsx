import { PageMeta } from '../../components/public/PageMeta.jsx';
import { SectionHeading } from '../../components/public/SectionHeading.jsx';

export function TermsPage() {
  return (
    <>
      <PageMeta title="Terms and Conditions" description="Terms for appropriate use of the PTMS public website and workspace." />
      <section className="public-page-hero">
        <div className="public-container public-page-hero-inner">
          <span className="public-eyebrow">Terms</span>
          <h1>Terms for<br /><span>appropriate use.</span></h1>
          <p>Use PTMS lawfully, protect your account, and submit only information relevant to legitimate project access or support.</p>
        </div>
      </section>
      <section className="public-section">
        <div className="public-container">
          <SectionHeading align="left" eyebrow="Terms overview" title="Responsible PTMS use" description="Access is governed by administrator assignments and role-based permissions." />
          <div className="public-benefit-grid">
            <article><h3>Authorized access</h3><p>Only use PTMS for work you are authorized to perform and do not attempt to bypass role or permission restrictions.</p></article>
            <article><h3>Accurate requests</h3><p>Provide accurate contact and organization information when submitting public forms.</p></article>
            <article><h3>Account security</h3><p>Keep credentials private, accept invitations securely, and report suspected unauthorized access to an administrator.</p></article>
          </div>
        </div>
      </section>
    </>
  );
}
