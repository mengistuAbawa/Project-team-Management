import { ROLES } from '../config/roles.js';

export const demoUsers = [
  { id: 'u1', name: 'Alex Morgan', email: 'admin@teamflow.demo', role: ROLES.ADMIN, initials: 'AM', department: 'Administration', status: 'Active' },
  { id: 'u2', name: 'Sarah Chen', email: 'manager@teamflow.demo', role: ROLES.PROJECT_MANAGER, initials: 'SC', department: 'Product', status: 'Active' },
  { id: 'u3', name: 'David Kim', email: 'leader@teamflow.demo', role: ROLES.TEAM_LEADER, initials: 'DK', department: 'Engineering', status: 'Active' },
  { id: 'u4', name: 'Maya Patel', email: 'member@teamflow.demo', role: ROLES.TEAM_MEMBER, initials: 'MP', department: 'Engineering', status: 'Active' },
  { id: 'u5', name: 'Jordan Lee', email: 'client@teamflow.demo', role: ROLES.CLIENT, initials: 'JL', department: 'External', status: 'Active' },
  { id: 'u6', name: 'Taylor Brooks', email: 'qa@teamflow.demo', role: ROLES.QA_REVIEWER, initials: 'TB', department: 'Quality Assurance', status: 'Active' },
];

export const demoProjects = [
  { id: 'PRJ-104', name: 'Customer Experience Platform', client: 'Northstar Inc.', owner: 'Sarah Chen', status: 'In progress', progress: 72, dueDate: '2026-12-12', members: 8, priority: 'High', description: 'A unified customer portal and service experience.' },
  { id: 'PRJ-103', name: 'Mobile Banking Redesign', client: 'FinEdge', owner: 'Sarah Chen', status: 'In review', progress: 88, dueDate: '2026-11-28', members: 6, priority: 'High', description: 'Modernize the mobile banking experience.' },
  { id: 'PRJ-102', name: 'Internal Knowledge Hub', client: 'Internal', owner: 'David Kim', status: 'In progress', progress: 46, dueDate: '2027-01-20', members: 5, priority: 'Medium', description: 'Centralized knowledge and documentation.' },
  { id: 'PRJ-101', name: 'Analytics Dashboard', client: 'Northstar Inc.', owner: 'Sarah Chen', status: 'Completed', progress: 100, dueDate: '2026-10-30', members: 7, priority: 'Low', description: 'Business intelligence and reporting dashboard.' },
];

export const demoTasks = [
  { id: 'TSK-241', title: 'Finalize onboarding flow', project: 'Customer Experience Platform', assignee: 'Maya Patel', status: 'In progress', priority: 'High', dueDate: '2026-11-18' },
  { id: 'TSK-240', title: 'Review payment API contract', project: 'Mobile Banking Redesign', assignee: 'David Kim', status: 'Review', priority: 'High', dueDate: '2026-11-16' },
  { id: 'TSK-239', title: 'Prepare usability test report', project: 'Mobile Banking Redesign', assignee: 'Taylor Brooks', status: 'Todo', priority: 'Medium', dueDate: '2026-11-21' },
  { id: 'TSK-238', title: 'Update component documentation', project: 'Internal Knowledge Hub', assignee: 'Maya Patel', status: 'Done', priority: 'Low', dueDate: '2026-11-12' },
  { id: 'TSK-237', title: 'Validate responsive layouts', project: 'Customer Experience Platform', assignee: 'Taylor Brooks', status: 'In progress', priority: 'Medium', dueDate: '2026-11-19' },
];

export const demoActivity = [
  { id: 1, actor: 'Maya Patel', action: 'completed a task', target: 'Update component documentation', time: '18 minutes ago' },
  { id: 2, actor: 'David Kim', action: 'commented on', target: 'Payment API contract', time: '1 hour ago' },
  { id: 3, actor: 'Sarah Chen', action: 'updated project progress', target: 'Customer Experience Platform', time: '3 hours ago' },
  { id: 4, actor: 'Taylor Brooks', action: 'submitted a review', target: 'Mobile Banking Redesign', time: 'Yesterday' },
];

export const demoNotifications = [
  { id: 1, title: 'Task assigned to you', detail: 'Finalize onboarding flow', time: '10 min ago', unread: true },
  { id: 2, title: 'Review requested', detail: 'Mobile Banking Redesign', time: '1 hour ago', unread: true },
  { id: 3, title: 'Meeting tomorrow', detail: 'Weekly project sync · 10:00 AM', time: 'Yesterday', unread: false },
];
