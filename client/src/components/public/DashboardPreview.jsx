import { ArrowUpRight, Check, Clock3, MoreHorizontal } from 'lucide-react';

const projects = [
  { name: 'Website redesign', team: 'Digital team', progress: 76, color: 'blue' },
  { name: 'Mobile app launch', team: 'Product team', progress: 54, color: 'teal' },
  { name: 'Client onboarding', team: 'Operations', progress: 88, color: 'violet' },
];

export function DashboardPreview() {
  return (
    <div className="preview-frame" aria-label="Illustrative PTMS project dashboard">
      <div className="preview-window">
        <div className="preview-sidebar">
          <div className="preview-logo"><span><Check size={14} /></span> ptms</div>
          <div className="preview-nav-current"><span /> Overview</div>
          <div className="preview-nav-line" /><div className="preview-nav-line short" />
          <div className="preview-nav-line" /><div className="preview-nav-line short" />
          <div className="preview-sidebar-bottom"><span className="preview-avatar">AM</span><span>Alex Morgan<small>Project manager</small></span></div>
        </div>
        <div className="preview-main">
          <div className="preview-topline"><span>Workspace / Overview</span><span className="preview-bell"><span /></span></div>
          <div className="preview-heading"><div><small>ILLUSTRATIVE DASHBOARD PREVIEW</small><h3>Good morning, Alex <span>✦</span></h3><p>Here’s what’s happening across your projects.</p></div><span className="preview-more" aria-hidden="true"><MoreHorizontal size={19} /></span></div>
          <div className="preview-stats">
            <div><small>Active projects</small><strong>12</strong><span>Across 4 teams</span></div>
            <div><small>Tasks completed</small><strong>84<span className="preview-up"> +12%</span></strong><span>This month</span></div>
            <div><small>On track</small><strong>91%</strong><span>Project health</span></div>
          </div>
          <div className="preview-projects">
            <div className="preview-list-title"><strong>Projects in progress</strong><span>View all <ArrowUpRight size={12} /></span></div>
            {projects.map((project) => (
              <div className="preview-project-row" key={project.name}>
                <span className={`preview-project-icon ${project.color}`}><Check size={13} /></span>
                <span className="preview-project-name">{project.name}<small>{project.team}</small></span>
                <span className="preview-progress"><span className={`progress-${project.color}`} style={{ width: `${project.progress}%` }} /></span>
                <strong>{project.progress}%</strong>
              </div>
            ))}
          </div>
          <div className="preview-next"><span><Clock3 size={15} /></span><div><b>Next milestone</b><small>Design review · Today, 2:30 PM</small></div><span className="preview-avatar small-avatar">JD</span></div>
        </div>
      </div>
      <div className="preview-float preview-float-check"><span><Check size={15} /></span><div><b>Task completed</b><small>Prototype review</small></div></div>
      <div className="preview-float preview-float-team"><div className="preview-team-dots"><i>AM</i><i>JD</i><i>SK</i></div><span><b>Team aligned</b><small>4 people collaborating</small></span></div>
    </div>
  );
}
