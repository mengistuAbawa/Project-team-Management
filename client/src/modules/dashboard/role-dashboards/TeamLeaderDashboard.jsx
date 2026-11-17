import * as Icons from 'lucide-react';
import { DashboardShell } from '../components/DashboardShell.jsx';
import { ProjectOverview } from '../components/ProjectOverview.jsx';
import { TaskOverview } from '../components/TaskOverview.jsx';
import { ProjectProgressChart } from '../components/ProjectProgressChart.jsx';

export function TeamLeaderDashboard() {
  const stats = [{ label: 'Team members', value: '8', change: '2 available today', icon: Icons.Users },
{ label: 'Active tasks', value: '19', change: '5 due this week', icon: Icons.ListTodo },
{ label: 'Awaiting review', value: '4', change: 'Review submissions', icon: Icons.ClipboardCheck },
{ label: 'Blockers', value: '2', change: 'Needs attention', icon: Icons.AlertTriangle }];
  return <DashboardShell title="Team leader dashboard" description="Coordinate your team and keep assigned work moving." stats={stats}>
    <div className="grid gap-6 lg:grid-cols-2"><ProjectOverview/><TaskOverview/></div>
    <ProjectProgressChart/>
  </DashboardShell>;
}
