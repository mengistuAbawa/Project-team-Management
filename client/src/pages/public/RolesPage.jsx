import { CTASection } from '../../components/public/CTASection.jsx';
import { PageMeta } from '../../components/public/PageMeta.jsx';
import { RoleCard } from '../../components/public/RoleCard.jsx';
import { SectionHeading } from '../../components/public/SectionHeading.jsx';
import { roles } from '../../data/publicContent.js';

export function RolesPage() {
  return (
    <>
      <PageMeta title="User roles" description="Learn how system administrators, project managers, team leaders, team members, clients, and QA reviewers contribute in PTMS." />
      <section className="public-page-hero">
        <div className="public-container public-page-hero-inner"><span className="public-eyebrow">Clear responsibilities, shared goals</span><h1>Every role has a part<br /><span>in project success.</span></h1><p>PTMS uses six distinct roles to keep access and responsibilities clear across the project lifecycle.</p></div>
      </section>
      <section className="public-section public-section-muted">
        <div className="public-container">
          <SectionHeading eyebrow="Six roles, one team" title="Built around the people doing the work" description="Each role supports a different part of project delivery. Access is assigned by your system administrator." />
          <div className="public-role-grid public-role-grid-large">{roles.map((role) => <RoleCard key={role.name} role={role} />)}</div>
          <p className="public-role-note">PTMS provides role-based access; private dashboard information is available only after sign-in and according to assigned permissions.</p>
        </div>
      </section>
      <CTASection title="Find the right path into your workspace." description="PTMS accounts are managed by your organization's system administrator." />
    </>
  );
}
