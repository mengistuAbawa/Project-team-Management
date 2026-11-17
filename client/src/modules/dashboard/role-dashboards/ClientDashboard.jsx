import * as Icons from 'lucide-react';
import { DashboardShell } from '../components/DashboardShell.jsx';
import { ProjectOverview } from '../components/ProjectOverview.jsx';
import { TaskOverview } from '../components/TaskOverview.jsx';
import { ProjectProgressChart } from '../components/ProjectProgressChart.jsx';

export function ClientDashboard() {
  const stats = [{ label: 'My projects', value: '2', change: 'Both active', icon: Icons.FolderKanban },
{ label: 'Deliverables', value: '5', change: '2 ready to review', icon: Icons.Files },
{ label: 'Pending approvals', value: '2', change: 'Your action needed', icon: Icons.ClipboardCheck },
{ label: 'Updates', value: '8', change: 'Recent project updates', icon: Icons.Bell }];
  return <DashboardShell title="Client portal" description="Follow project progress, review deliverables and share feedback." stats={stats}>
    <div className="grid gap-6 lg:grid-cols-2"><ProjectOverview/><TaskOverview/></div>
    <ProjectProgressChart/>
  </DashboardShell>;
}
