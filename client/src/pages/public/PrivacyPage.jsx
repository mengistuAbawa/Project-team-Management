import { PageMeta } from '../../components/public/PageMeta.jsx';
import { SectionHeading } from '../../components/public/SectionHeading.jsx';

export function PrivacyPage() {
  return (
    <>
      <PageMeta title="Privacy Policy" description="How PTMS handles public submissions and account data." />
      <section className="public-page-hero">
        <div className="public-container public-page-hero-inner">
          <span className="public-eyebrow">Privacy</span>
          <h1>Privacy and<br /><span>responsible use.</span></h1>
          <p>PTMS uses submitted information only to support account access, project collaboration, and administrator review.</p>
        </div>
      </section>
      <section className="public-section">
        <div className="public-container">
          <SectionHeading align="left" eyebrow="Privacy overview" title="Information submitted through PTMS" description="Public contact and access-request forms collect only the details needed to review a request." />
          <div className="public-benefit-grid">
            <article><h3>Public submissions</h3><p>Contact messages and access requests are validated, stored, and available only to authorized administrators for review.</p></article>
            <article><h3>Account access</h3><p>Authentication information and account roles are protected by server authorization and should not be shared with other people.</p></article>
            <article><h3>Your responsibility</h3><p>Do not submit passwords, payment information, or other sensitive personal information through public forms.</p></article>
          </div>
        </div>
      </section>
    </>
  );
}
