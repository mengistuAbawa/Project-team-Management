import { useState } from 'react';
import { ArrowDown, ArrowRight, Check, ChevronDown, Compass, Gauge, Layers3, UsersRound } from 'lucide-react';
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
  const [openFaq, setOpenFaq] = useState(0);
  const faqItems = [
    ['What is PTMS?', 'PTMS is a role-based project team management system for planning projects, coordinating teams, tracking tasks, collaborating, reviewing quality, and reporting progress.'],
    ['Who can use PTMS?', 'Six roles are supported: System Administrator, Project Manager, Team Leader, Team Member, QA Reviewer, and Client.'],
    ['How can I access my account?', 'Use the Sign in page with credentials issued by your organization. Public users cannot create privileged accounts themselves.'],
    ['Who creates user accounts?', 'System Administrators create accounts through the administrator invitation workflow.'],
    ['Who creates projects?', 'The System Administrator creates projects and assigns a Project Manager.'],
    ['How are Project Managers assigned?', 'A System Administrator assigns a Project Manager when the project is created or managed by an authorized administrator.'],
    ['How are tasks assigned?', 'Project and team planning establishes owners; Team Leaders distribute tasks to Team Members.'],
    ['How does the QA review process work?', 'Team Members submit deliverables, QA Reviewers test and verify them, and defect or correction feedback is tracked until verification.'],
    ['Can clients monitor their projects?', 'Yes. Assigned clients can monitor project progress and review, comment on, and approve eligible deliverables through their authorized workspace.'],
    ['How can I request an account?', 'Complete the Request Access form. An administrator reviews it and, if approved, selects a permitted role and sends a secure invitation.'],
  ];
  const lifecycle = [
    ['Project Initiation', 'Define the project and authorize delivery.'],
    ['Project Planning', 'Set objectives, schedules, resources, and milestones.'],
    ['Team Formation', 'Assign team leaders and members.'],
    ['Task Execution', 'Complete assigned work and submit deliverables.'],
    ['Progress Monitoring', 'Track tasks, risks, blockers, and milestones.'],
    ['Quality Assurance', 'Test, report defects, and verify corrections.'],
    ['Client Review', 'Collect feedback and approvals.'],
    ['Project Completion', 'Close final status and report outcomes.'],
  ];
  return (
    <>
      <PageMeta title="Manage projects. Empower teams." description="Discover PTMS, a project team management system that brings projects, tasks, people, and collaboration into one shared workspace." />
      <section className="public-hero">
        <div className="public-hero-glow" aria-hidden="true" />
        <div className="public-container public-hero-grid">
          <motion.div className="public-hero-copy" initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <span className="public-eyebrow"><span className="eyebrow-dot" /> One workspace. Better teamwork.</span>
            <h1>Manage Projects.<br /><span>Empower Teams.</span><br />Deliver Results.</h1>
            <p>Plan projects, coordinate teams, manage tasks, track progress and deliver quality results through one centralized project management platform.</p>
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
            <article><span>01</span><h3>Centralized management</h3><p>Keep projects, tasks, teams, documents, and reports in one shared system.</p></article>
            <article><span>02</span><h3>Clear communication</h3><p>Reduce communication fragmentation with role-aware project context.</p></article>
            <article><span>03</span><h3>Better task organization</h3><p>Use priorities, deadlines, dependencies, subtasks, and status to structure work.</p></article>
            <article><span>04</span><h3>Project visibility</h3><p>Make progress, responsibilities, blockers, and milestones easier to follow.</p></article>
            <article><span>05</span><h3>Accountability</h3><p>Give work a clear owner and keep commitments visible.</p></article>
            <article><span>06</span><h3>Quality control</h3><p>Include structured testing, defect reporting, correction, and verification.</p></article>
            <article><span>07</span><h3>Resource efficiency</h3><p>Coordinate people and assignments across active project work.</p></article>
            <article><span>08</span><h3>Useful reporting</h3><p>Summarize project, task, and team performance for informed decisions.</p></article>
            <article><span>09</span><h3>Reduced fragmentation</h3><p>Bring updates, meetings, files, and feedback closer to delivery work.</p></article>
            <article><span>10</span><h3>Client collaboration</h3><p>Support project monitoring, review, feedback, change requests, and approval.</p></article>
          </div>
        </div>
      </section>

      <section className="public-section public-section-muted">
        <div className="public-container">
          <SectionHeading eyebrow="Project lifecycle" title="From initiation to confident completion" description="A consistent lifecycle keeps work, quality, and approvals connected." />
          <div className="public-lifecycle">
            {lifecycle.map(([title, description], index) => (
              <article className="public-lifecycle-stage" key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container public-faq-layout">
          <div>
            <span className="public-eyebrow">Common questions</span>
            <h2 className="public-faq-title">Answers for teams getting started.</h2>
            <p className="public-faq-copy">Understand roles, access, project setup, and the approval workflow.</p>
          </div>
          <div className="public-faq-list">
            {faqItems.map(([question, answer], index) => {
              const isOpen = openFaq === index;
              return (
                <article className={`public-faq-item${isOpen ? ' is-open' : ''}`} key={question}>
                  <h3>
                    <button type="button" aria-expanded={isOpen} aria-controls={`faq-answer-${index}`} onClick={() => setOpenFaq(isOpen ? -1 : index)}>
                      <span>{question}</span><ChevronDown size={18} aria-hidden="true" />
                    </button>
                  </h3>
                  <div id={`faq-answer-${index}`} className="public-faq-answer" hidden={!isOpen}><p>{answer}</p></div>
                </article>
              );
            })}
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
