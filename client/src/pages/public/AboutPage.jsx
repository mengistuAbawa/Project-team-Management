import { Compass, HeartHandshake, Lightbulb, Target } from 'lucide-react';
import { CTASection } from '../../components/public/CTASection.jsx';
import { PageMeta } from '../../components/public/PageMeta.jsx';
import { SectionHeading } from '../../components/public/SectionHeading.jsx';

const values = [
  { icon: Compass, title: 'Clarity', text: 'Make goals, ownership, and progress easier for everyone to understand.' },
  { icon: HeartHandshake, title: 'Collaboration', text: 'Help people work together across roles and project boundaries.' },
  { icon: Lightbulb, title: 'Continuous improvement', text: 'Make feedback and quality part of how teams deliver.' },
  { icon: Target, title: 'Accountability', text: 'Give work a clear owner and keep commitments visible.' },
];

export function AboutPage() {
  return (
    <>
      <PageMeta title="About" description="Learn about the PTMS mission, vision, objectives, values, and how the platform supports organizations and teams." />
      <section className="public-page-hero">
        <div className="public-container public-page-hero-inner"><span className="public-eyebrow">About PTMS</span><h1>Better coordination.<br /><span>More meaningful progress.</span></h1><p>PTMS is a project team management system designed to bring project planning, teamwork, and delivery into one shared workspace.</p></div>
      </section>
      <section className="public-section">
        <div className="public-container public-about-intro">
          <div><span className="public-eyebrow">What PTMS is</span><h2>One place to make the work visible.</h2></div>
          <div><p>Projects involve many people, decisions, and moving parts. PTMS gives organizations a structured way to manage projects, teams, tasks, communication, documents, and quality reviews together.</p><p>Role-based access helps each contributor focus on the responsibilities relevant to them, while the wider team shares a clear view of project progress.</p></div>
        </div>
      </section>
      <section className="public-section public-section-muted">
        <div className="public-container public-mission-grid">
          <article className="public-mission-card"><span className="public-icon-tile"><Compass size={21} /></span><span className="public-eyebrow">Our vision</span><h2>Teams aligned around work that matters.</h2><p>We envision organizations where people can work with shared context, clear ownership, and confidence in every step from planning through delivery.</p></article>
          <article className="public-mission-card mission-dark"><span className="public-icon-tile"><Target size={21} /></span><span className="public-eyebrow public-eyebrow-light">Our mission</span><h2>Make project collaboration more connected.</h2><p>PTMS helps bring project workflows, team responsibilities, and useful feedback together so organizations can coordinate work more effectively.</p></article>
        </div>
      </section>
      <section className="public-section">
        <div className="public-container">
          <SectionHeading eyebrow="The difference we aim to make" title="Problems PTMS is designed to solve" description="A shared project system can reduce coordination friction and make delivery easier to follow." />
          <div className="public-problem-grid"><article><b>Scattered updates</b><p>Keep project conversations and updates connected to shared work.</p></article><article><b>Unclear ownership</b><p>Make responsibilities, team roles, and task assignment more visible.</p></article><article><b>Limited progress context</b><p>Bring project status and task progress into a shared view.</p></article><article><b>Late quality feedback</b><p>Include review and client feedback in the delivery workflow.</p></article></div>
        </div>
      </section>
      <section className="public-section public-section-muted">
        <div className="public-container">
          <SectionHeading eyebrow="How we work" title="Values behind the platform" description="These principles guide PTMS's approach to project collaboration." />
          <div className="public-value-grid">{values.map(({ icon: Icon, title, text }) => <article key={title}><span className="public-icon-tile"><Icon size={21} /></span><h3>{title}</h3><p>{text}</p></article>)}</div>
        </div>
      </section>
      <section className="public-section">
        <div className="public-container public-objectives">
          <div><span className="public-eyebrow">Our objectives</span><h2>Support the full life of a project.</h2><p>From setting up a workspace through review and reporting, PTMS aims to give every contributor the context they need.</p></div>
          <ul><li>Connect projects, teams, tasks, and documents.</li><li>Support clear responsibilities for six user roles.</li><li>Make communication, meetings, and feedback part of delivery.</li><li>Help teams review progress and learn from outcomes.</li></ul>
        </div>
      </section>
      <CTASection title="Ready for a more connected workflow?" />
    </>
  );
}
