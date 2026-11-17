import * as Icons from 'lucide-react';
import { DashboardShell } from '../components/DashboardShell.jsx';
import { ProjectOverview } from '../components/ProjectOverview.jsx';
import { TaskOverview } from '../components/TaskOverview.jsx';
import { ProjectProgressChart } from '../components/ProjectProgressChart.jsx';

export function QADashboard() {
  const stats = [{ label: 'Review queue', value: '9', change: '3 high priority', icon: Icons.ClipboardCheck },
{ label: 'Open defects', value: '12', change: '4 critical', icon: Icons.Bug },
{ label: 'Verified this week', value: '18', change: 'Quality checks passed', icon: Icons.ShieldCheck },
{ label: 'Assigned projects', value: '4', change: 'Across 3 teams', icon: Icons.FolderKanban }];
  return <DashboardShell title="Quality assurance dashboard" description="Review submitted work, track defects and verify fixes." stats={stats}>
    <div className="grid gap-6 lg:grid-cols-2"><ProjectOverview/><TaskOverview/></div>
    <ProjectProgressChart/>
  </DashboardShell>;
}
