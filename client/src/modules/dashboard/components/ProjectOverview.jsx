import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge.jsx';
import { demoProjects } from '../../../data/mockData.js';
export function ProjectOverview({ items = demoProjects.slice(0,3) }) {
  return <section className="panel p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Project overview</h2><Link to="/projects" className="flex items-center gap-1 text-xs font-semibold text-indigo-600">View all <ArrowUpRight size={14}/></Link></div><div className="space-y-5">{items.map((p) => <div key={p.id}><div className="mb-2 flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-800">{p.name}</p><p className="mt-0.5 text-xs text-slate-400">{p.id} · Due {p.dueDate}</p></div><Badge>{p.status}</Badge></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500" style={{width:`${p.progress}%`}}/></div><p className="mt-1 text-right text-xs text-slate-500">{p.progress}% complete</p></div>)}</div></section>;
}
