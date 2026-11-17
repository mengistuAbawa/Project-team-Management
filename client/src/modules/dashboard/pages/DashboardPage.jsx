import { useAuth } from '../../../app/providers/AuthProvider.jsx';
import { AdminDashboard } from '../role-dashboards/AdminDashboard.jsx';
import { ProjectManagerDashboard } from '../role-dashboards/ProjectManagerDashboard.jsx';
import { TeamLeaderDashboard } from '../role-dashboards/TeamLeaderDashboard.jsx';
import { TeamMemberDashboard } from '../role-dashboards/TeamMemberDashboard.jsx';
import { ClientDashboard } from '../role-dashboards/ClientDashboard.jsx';
import { QADashboard } from '../role-dashboards/QADashboard.jsx';

export function DashboardPage() {
  const { user } = useAuth();
  const dashboards = {
    system_admin: AdminDashboard,
    project_manager: ProjectManagerDashboard,
    team_leader: TeamLeaderDashboard,
    team_member: TeamMemberDashboard,
    client: ClientDashboard,
    qa_reviewer: QADashboard,
  };
  const Dashboard = dashboards[user?.role] || TeamMemberDashboard;
  return <Dashboard />;
}
