import * as Icons from 'lucide-react';
import { DashboardShell } from '../components/DashboardShell.jsx';
import { ProjectOverview } from '../components/ProjectOverview.jsx';
import { TaskOverview } from '../components/TaskOverview.jsx';
import { ProjectProgressChart } from '../components/ProjectProgressChart.jsx';

export function AdminDashboard() {
  const stats = [{ label: 'Total users', value: '248', change: '+12 this month', icon: Icons.Users },
{ label: 'Active projects', value: '32', change: '8 due this month', icon: Icons.FolderKanban },
{ label: 'Teams', value: '18', change: 'Across 6 departments', icon: Icons.UsersRound },
{ label: 'Open tasks', value: '146', change: '23 overdue', icon: Icons.ListTodo }];
  return <DashboardShell title="Administrator dashboard" description="Organization-wide visibility into users, projects and delivery." stats={stats}>
    <div className="grid gap-6 lg:grid-cols-2"><ProjectOverview/><TaskOverview/></div>
    <ProjectProgressChart/>
  </DashboardShell>;
}
