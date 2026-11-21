import {
  Activity,
  BarChart3,
  BellRing,
  BriefcaseBusiness,
  CalendarDays,
  CheckCheck,
  ClipboardCheck,
  FileText,
  FolderKanban,
  MessageCircle,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';

export const features = [
  { icon: FolderKanban, title: 'Project management', description: 'Create and plan projects, set deadlines and milestones, assign managers, and monitor delivery progress.' },
  { icon: UsersRound, title: 'Team management', description: 'Create teams, assign team leaders and members, and monitor team activity across projects.' },
  { icon: CheckCheck, title: 'Task management', description: 'Create assigned tasks with priorities, deadlines, dependencies, subtasks, progress, and deliverables.' },
  { icon: MessageCircle, title: 'Collaboration', description: 'Use project conversations, team messaging, and task comments to keep context close to the work.' },
  { icon: CalendarDays, title: 'Meetings', description: 'Schedule meetings, set participants and agendas, and track meeting status.' },
  { icon: FileText, title: 'Document management', description: 'Upload, organize, and share project documents and supporting files.' },
  { icon: ClipboardCheck, title: 'Quality assurance', description: 'Review deliverables, report defects, request corrections, and verify completed fixes.' },
  { icon: BellRing, title: 'Notifications', description: 'Receive task, project, meeting, and review notifications for important work updates.' },
  { icon: BarChart3, title: 'Reports and analytics', description: 'Review project progress, team performance, task status, and delivery analytics.' },
  { icon: ShieldCheck, title: 'Client management', description: 'Enable client project monitoring, deliverable review, feedback, change requests, and approval.' },
  { icon: Activity, title: 'Activity tracking', description: 'Maintain visibility into project updates and the work happening across teams.' },
  { icon: BriefcaseBusiness, title: 'One connected workspace', description: 'Bring projects, teams, tasks, and collaboration together in a shared system.' },
];

export const roles = [
  { name: 'System Administrator', short: 'System Admin', icon: ShieldCheck, color: 'blue', description: 'Sets up organizations and departments, manages users and roles, creates projects, configures the system, and reviews reports and audit activity.', responsibilities: ['Organizations and departments', 'User and role management', 'Projects and reporting'] },
  { name: 'Project Manager', short: 'Project Manager', icon: BriefcaseBusiness, color: 'violet', description: 'Plans assigned projects, organizes teams and resources, coordinates work, monitors progress, and manages authorized approvals.', responsibilities: ['Planning and team organization', 'Resource and task coordination', 'Monitoring and client coordination'] },
  { name: 'Team Leader', short: 'Team Leader', icon: UsersRound, color: 'teal', description: 'Coordinates assigned team members, distributes and monitors tasks, communicates progress, and reports blockers.', responsibilities: ['Task distribution', 'Team communication', 'Progress and blocker reporting'] },
  { name: 'Team Member', short: 'Team Member', icon: CheckCheck, color: 'amber', description: 'Executes assigned tasks, updates progress, submits deliverables, collaborates, and reports blockers.', responsibilities: ['Assigned task execution', 'Progress and deliverables', 'Team collaboration'] },
  { name: 'Client', short: 'Client', icon: MessageCircle, color: 'rose', description: 'Monitors assigned projects, reviews deliverables, provides feedback and change requests, and records approval.', responsibilities: ['Project monitoring', 'Deliverable review', 'Feedback and approval'] },
  { name: 'QA Reviewer', short: 'QA Reviewer', icon: ClipboardCheck, color: 'indigo', description: 'Tests deliverables, verifies corrections, reports defects, manages review activity, and provides quality reports.', responsibilities: ['Testing and verification', 'Defect reporting', 'Correction and quality review'] },
];

export const workflow = [
  'Organization Setup — The System Administrator creates organizations and departments.',
  'User Management — The System Administrator creates accounts and assigns system roles.',
  'Project Creation — The System Administrator creates projects and assigns Project Managers.',
  'Project Planning — Project Managers define objectives, schedules, resources, and plans.',
  'Team Formation — Project Managers organize teams and assign Team Leaders and Team Members.',
  'Task Assignment — Team Leaders distribute tasks and monitor team progress.',
  'Task Execution — Team Members complete tasks and submit deliverables.',
  'Quality Review — QA Reviewers evaluate deliverables, report defects, and verify corrections.',
  'Client Review — Clients review deliverables and provide feedback or approval.',
  'Project Completion — The Project Manager monitors final status and completes the project.',
];
