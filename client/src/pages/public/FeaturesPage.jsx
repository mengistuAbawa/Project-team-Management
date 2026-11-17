import { CTASection } from '../../components/public/CTASection.jsx';
import { FeatureCard } from '../../components/public/FeatureCard.jsx';
import { PageMeta } from '../../components/public/PageMeta.jsx';
import { SectionHeading } from '../../components/public/SectionHeading.jsx';
import { features } from '../../data/publicContent.js';

export function FeaturesPage() {
  return (
    <>
      <PageMeta title="Features" description="Explore PTMS capabilities for project management, teams, tasks, communication, documents, quality reviews, and reporting." />
      <section className="public-page-hero">
        <div className="public-container public-page-hero-inner"><span className="public-eyebrow">PTMS capabilities</span><h1>Everything your team needs<br /><span>to deliver together.</span></h1><p>Coordinate your projects from one shared workspace, with practical tools for every role and every stage of delivery.</p></div>
      </section>
      <section className="public-section public-section-muted">
        <div className="public-container">
          <SectionHeading eyebrow="Connected project work" title="Purpose-built for team delivery" description="PTMS combines the essential building blocks of project coordination and collaboration." />
          <div className="public-feature-grid public-feature-grid-wide">{features.map((feature, index) => <FeatureCard key={feature.title} feature={feature} index={index} />)}</div>
        </div>
      </section>
      <CTASection title="Make your project workflow work for everyone." />
    </>
  );
}
