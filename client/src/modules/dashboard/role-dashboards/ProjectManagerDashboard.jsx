import * as Icons from 'lucide-react';
import { DashboardShell } from '../components/DashboardShell.jsx';
import { ProjectOverview } from '../components/ProjectOverview.jsx';
import { TaskOverview } from '../components/TaskOverview.jsx';
import { ProjectProgressChart } from '../components/ProjectProgressChart.jsx';

export function ProjectManagerDashboard() {
  const stats = [{ label: 'My projects', value: '8', change: '3 nearing deadline', icon: Icons.FolderKanban },
{ label: 'Tasks in progress', value: '42', change: '76% on schedule', icon: Icons.ListTodo },
{ label: 'Team members', value: '36', change: 'Across 5 teams', icon: Icons.Users },
{ label: 'Pending approvals', value: '7', change: 'Needs your review', icon: Icons.ClipboardCheck }];
  return <DashboardShell title="Project manager dashboard" description="Track delivery, team capacity and project milestones." stats={stats}>
    <div className="grid gap-6 lg:grid-cols-2"><ProjectOverview/><TaskOverview/></div>
    <ProjectProgressChart/>
  </DashboardShell>;
}
