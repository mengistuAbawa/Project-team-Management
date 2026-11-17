import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { StatCard } from '../../../components/ui/StatCard.jsx';
import { ActivityFeed } from './ActivityFeed.jsx';
import { demoActivity } from '../../../data/mockData.js';

export function DashboardShell({ title, description, stats, children }) {
  return <><PageHeader title={title} description={description}/><div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => <StatCard key={stat.label} {...stat}/>)}</div><div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]"><div className="space-y-6">{children}</div><ActivityFeed items={demoActivity}/></div></>;
}
