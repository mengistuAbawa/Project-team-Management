import { ArrowDown, ArrowRight, Check, Compass, Gauge, Layers3, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { CTASection } from '../../components/public/CTASection.jsx';
import { DashboardPreview } from '../../components/public/DashboardPreview.jsx';
import { FeatureCard } from '../../components/public/FeatureCard.jsx';
import { PageMeta } from '../../components/public/PageMeta.jsx';
import { RoleCard } from '../../components/public/RoleCard.jsx';
import { SectionHeading } from '../../components/public/SectionHeading.jsx';
import { features, roles, workflow } from '../../data/publicContent.js';

const highlights = [
  { icon: Layers3, value: '12', label: 'connected capabilities' },
  { icon: UsersRound, value: '6', label: 'clear user roles' },
  { icon: Compass, value: '8', label: 'steps from setup to delivery' },
  { icon: Gauge, value: '1', label: 'shared project workspace' },
];

export function HomePage() {
  const reduceMotion = useReducedMotion();
  return (
    <>
      <PageMeta title="Manage projects. Empower teams." description="Discover PTMS, a project team management system that brings projects, tasks, people, and collaboration into one shared workspace." />
      <section className="public-hero">
        <div className="public-hero-glow" aria-hidden="true" />
        <div className="public-container public-hero-grid">
          <motion.div className="public-hero-copy" initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <span className="public-eyebrow"><span className="eyebrow-dot" /> One workspace. Better teamwork.</span>
            <h1>Manage projects.<br /><span>Empower teams.</span><br />Deliver excellence.</h1>
            <p>Bring plans, people, and progress together. PTMS helps your organization make work visible and teams more connected from kickoff to delivery.</p>
            <div className="public-hero-actions">
              <Link to="/request-access" className="public-button">Get started <ArrowRight size={17} /></Link>
              <Link to="/features" className="public-button public-button-outline">Explore features <ArrowDown size={16} /></Link>
            </div>
            <div className="public-hero-trust"><span className="hero-check"><Check size={14} /></span>Role-based access <span className="hero-dot">·</span> One connected workflow</div>
          </motion.div>
          <motion.div className="public-hero-visual" initial={reduceMotion ? false : { opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65, delay: 0.12 }}>
            <DashboardPreview />
          </motion.div>
        </div>
        <div className="public-container public-hero-caption"><span>DESIGNED TO KEEP EVERYONE MOVING FORWARD</span><span className="caption-line" /></div>
      </section>

      <section className="public-stats-section">
        <div className="public-container public-stats-grid">
          {highlights.map(({ icon: Icon, value, label }) => <div className="public-stat" key={label}><span className="public-stat-icon"><Icon size={19} /></span><div><strong>{value}</strong><span>{label}</span></div></div>)}
        </div>
      </section>

      <section className="public-section public-section-muted">
        <div className="public-container">
          <SectionHeading eyebrow="Everything in sync" title="The tools for work that moves forward" description="Connect the people, plans, and practices that make projects successful." />
          <div className="public-feature-grid">{features.slice(0, 6).map((feature, index) => <FeatureCard key={feature.title} feature={feature} index={index} />)}</div>
          <div className="public-center-link"><Link to="/features" className="public-text-link">Explore all features <ArrowRight size={16} /></Link></div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container">
          <SectionHeading eyebrow="A role for every contributor" title="One team, with clear responsibilities" description="PTMS supports every part of your delivery team with role-based access and shared project context." />
          <div className="public-role-grid">{roles.map((role) => <RoleCard key={role.name} role={role} />)}</div>
          <div className="public-center-link"><Link to="/roles" className="public-text-link">See how each role contributes <ArrowRight size={16} /></Link></div>
        </div>
      </section>

      <section className="public-section public-work-section">
        <div className="public-container public-work-grid">
          <div>
            <span className="public-eyebrow">A connected delivery process</span>
            <h2 className="public-work-title">From a clear plan<br />to a confident finish.</h2>
            <p className="public-work-copy">Bring the right people into each stage of the work. PTMS gives teams a shared view of tasks, reviews, and progress without losing sight of the outcome.</p>
            <Link to="/how-it-works" className="public-text-link">See how PTMS works <ArrowRight size={16} /></Link>
          </div>
          <div className="public-work-list">
            {workflow.slice(0, 4).map((step, index) => <div className="public-work-step" key={step}><span>{String(index + 1).padStart(2, '0')}</span><p>{step}</p></div>)}
            <div className="public-work-more">...and through review, client feedback, and delivery reporting.</div>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container">
          <SectionHeading eyebrow="Built for how teams deliver" title="Clarity that helps people do their best work" description="A shared system makes it easier to coordinate work and keep teams focused on outcomes." />
          <div className="public-benefit-grid">
            <article><span>01</span><h3>Shared visibility</h3><p>Make responsibilities, status, and important milestones easier to understand.</p></article>
            <article><span>02</span><h3>Purposeful collaboration</h3><p>Keep conversations and project context close to the work they support.</p></article>
            <article><span>03</span><h3>Quality with confidence</h3><p>Build structured reviews and feedback into your project delivery process.</p></article>
          </div>
        </div>
      </section>

      <section className="public-section public-testimonials">
        <div className="public-container">
          <SectionHeading eyebrow="A glimpse of the workflow" title="A more connected way to work" description="These illustrative examples describe intended PTMS workflows; they are not customer testimonials." />
          <div className="public-quote-grid">
            <blockquote><span className="public-quote-tag">Illustrative example</span><p>“A team can see the next owner, due date, and review status without piecing the project together from separate updates.”</p><footer>Example workflow <span>· Team coordination</span></footer></blockquote>
            <blockquote><span className="public-quote-tag">Illustrative example</span><p>“A client can follow progress and share feedback as part of the project process, while the delivery team keeps ownership clear.”</p><footer>Example workflow <span>· Client collaboration</span></footer></blockquote>
          </div>
        </div>
      </section>
      <CTASection />
    </>
  );
}
