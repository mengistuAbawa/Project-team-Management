import { ROLES } from './roles.js';

const all = [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.TEAM_LEADER, ROLES.TEAM_MEMBER, ROLES.CLIENT, ROLES.QA_REVIEWER];
export const navigation = [
  { label: 'Overview', items: [{ label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', roles: all }] },
  { label: 'Workspace', items: [
    { label: 'Projects', path: '/projects', icon: 'FolderKanban', roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.TEAM_LEADER, ROLES.TEAM_MEMBER, ROLES.CLIENT] },
    { label: 'Teams', path: '/teams', icon: 'Users', roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.TEAM_LEADER] },
    { label: 'Tasks', path: '/tasks', icon: 'CheckSquare', roles: all },
    { label: 'Reviews', path: '/reviews', icon: 'ClipboardCheck', roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.TEAM_LEADER, ROLES.QA_REVIEWER] },
  ]},
  { label: 'Collaboration', items: [
    { label: 'Messages', path: '/messages', icon: 'MessageSquare', roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.TEAM_LEADER, ROLES.TEAM_MEMBER, ROLES.CLIENT] },
    { label: 'Meetings', path: '/meetings', icon: 'CalendarDays', roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.TEAM_LEADER, ROLES.TEAM_MEMBER, ROLES.CLIENT] },
    { label: 'Documents', path: '/documents', icon: 'Files', roles: all },
    { label: 'Notifications', path: '/notifications', icon: 'Bell', roles: all },
  ]},
  { label: 'Administration', items: [
    { label: 'Users', path: '/users', icon: 'UserRoundCog', roles: [ROLES.ADMIN] },
    { label: 'Public requests', path: '/admin/requests', icon: 'Inbox', roles: [ROLES.ADMIN] },
    { label: 'Reports', path: '/reports', icon: 'ChartNoAxesCombined', roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.QA_REVIEWER] },
    { label: 'Activity', path: '/activity', icon: 'Activity', roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER] },
    { label: 'Settings', path: '/settings', icon: 'Settings', roles: all },
  ]},
  { label: 'Account', items: [{ label: 'My profile', path: '/profile', icon: 'CircleUserRound', roles: all }] },
];
