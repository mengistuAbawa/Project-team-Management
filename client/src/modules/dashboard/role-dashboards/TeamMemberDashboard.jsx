import * as Icons from 'lucide-react';
import { DashboardShell } from '../components/DashboardShell.jsx';
import { ProjectOverview } from '../components/ProjectOverview.jsx';
import { TaskOverview } from '../components/TaskOverview.jsx';
import { ProjectProgressChart } from '../components/ProjectProgressChart.jsx';

export function TeamMemberDashboard() {
  const stats = [{ label: 'My open tasks', value: '6', change: '2 due this week', icon: Icons.ListTodo },
{ label: 'Completed tasks', value: '24', change: 'This month', icon: Icons.CheckCircle2 },
{ label: 'Projects', value: '3', change: 'Currently assigned', icon: Icons.FolderKanban },
{ label: 'Unread messages', value: '4', change: 'Team conversations', icon: Icons.MessageSquare }];
  return <DashboardShell title="My workspace" description="Your assigned work, upcoming deadlines and team updates." stats={stats}>
    <div className="grid gap-6 lg:grid-cols-2"><ProjectOverview/><TaskOverview/></div>
    <ProjectProgressChart/>
  </DashboardShell>;
}
