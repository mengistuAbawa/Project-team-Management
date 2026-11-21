import { ArrowDown } from 'lucide-react';
import { CTASection } from '../../components/public/CTASection.jsx';
import { PageMeta } from '../../components/public/PageMeta.jsx';
import { SectionHeading } from '../../components/public/SectionHeading.jsx';
import { workflow } from '../../data/publicContent.js';

export function HowItWorksPage() {
  return (
    <>
      <PageMeta title="How it works" description="Follow the PTMS workflow, from workspace setup and project planning through quality review and completion." />
      <section className="public-page-hero">
        <div className="public-container public-page-hero-inner"><span className="public-eyebrow">A clear path from idea to delivery</span><h1>Good work happens<br /><span>one step at a time.</span></h1><p>PTMS helps each person understand their part in the project while keeping the full team connected to shared progress.</p></div>
      </section>
      <section className="public-section">
        <div className="public-container public-process">
          <SectionHeading eyebrow="The PTMS workflow" title="From workspace setup to project completion" description="A straightforward sequence gives every role a part to play and each project a clear path forward." />
          <div className="public-timeline">
            {workflow.map((step, index) => (
              <article className="public-timeline-item" key={step}>
                <span className="public-timeline-number">{String(index + 1).padStart(2, '0')}</span>
                <div><span className="public-timeline-label">{['Organization setup', 'User management', 'Project creation', 'Project planning', 'Team formation', 'Task assignment', 'Task execution', 'Quality review', 'Client review', 'Project completion'][index]}</span><h3>{step.replace(/^[^-—]+[—-]\s*/, '')}</h3></div>
                {index < workflow.length - 1 && <ArrowDown className="public-timeline-arrow" size={17} aria-hidden="true" />}
              </article>
            ))}
          </div>
        </div>
      </section>
      <CTASection title="Every role. One shared project journey." />
    </>
  );
}
