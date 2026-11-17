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
  { icon: FolderKanban, title: 'Project management', description: 'Bring project plans, milestones, ownership, and progress into one clear workspace.' },
  { icon: UsersRound, title: 'Team management', description: 'Organize people around projects and give every role a clear place in the workflow.' },
  { icon: CheckCheck, title: 'Task assignment and tracking', description: 'Turn priorities into owned tasks with visible status, deadlines, and handoffs.' },
  { icon: MessageCircle, title: 'Team communication', description: 'Keep project conversations close to the work and make decisions easier to follow.' },
  { icon: CalendarDays, title: 'Meetings and collaboration', description: 'Coordinate schedules and help teams stay aligned around the next milestone.' },
  { icon: FileText, title: 'Document management', description: 'Keep project files and supporting documents organized for the people who need them.' },
  { icon: ClipboardCheck, title: 'Quality assurance', description: 'Give reviewers a structured way to inspect work and share actionable feedback.' },
  { icon: BellRing, title: 'Timely notifications', description: 'Help people keep track of updates, assignments, and important project events.' },
  { icon: BarChart3, title: 'Reports and analytics', description: 'Summarize delivery progress and project activity for informed decisions.' },
  { icon: ShieldCheck, title: 'Client feedback and approvals', description: 'Make client review part of a clear, collaborative delivery process.' },
  { icon: Activity, title: 'Activity tracking', description: 'Maintain visibility into project updates and the work happening across teams.' },
  { icon: BriefcaseBusiness, title: 'One connected workspace', description: 'Bring projects, teams, tasks, and collaboration together in a shared system.' },
];

export const roles = [
  { name: 'System Administrator', short: 'System Admin', icon: ShieldCheck, color: 'blue', description: 'Sets up the workspace, manages user accounts, and assigns the right access roles.' },
  { name: 'Project Manager', short: 'Project Manager', icon: BriefcaseBusiness, color: 'violet', description: 'Plans projects, coordinates delivery, tracks progress, and shares reports.' },
  { name: 'Team Leader', short: 'Team Leader', icon: UsersRound, color: 'teal', description: 'Organizes the team, distributes tasks, and helps work move forward.' },
  { name: 'Team Member', short: 'Team Member', icon: CheckCheck, color: 'amber', description: 'Completes assigned work, collaborates with teammates, and shares updates.' },
  { name: 'Client', short: 'Client', icon: MessageCircle, color: 'rose', description: 'Follows project progress, reviews deliverables, and provides feedback.' },
  { name: 'QA Reviewer', short: 'QA Reviewer', icon: ClipboardCheck, color: 'indigo', description: 'Reviews submissions against expectations and helps uphold quality.' },
];

export const workflow = [
  'An organization establishes its PTMS workspace.',
  'A system administrator creates user accounts and assigns roles.',
  'A project manager creates projects and defines the work.',
  'Team leaders organize teams and distribute tasks.',
  'Team members complete assigned work and share progress.',
  'QA reviewers inspect submissions and verify quality.',
  'Clients monitor progress and review deliverables.',
  'Project managers report on outcomes and complete projects.',
];
