import { Link } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge.jsx';
import { demoTasks } from '../../../data/mockData.js';
export function TaskOverview({ items = demoTasks.slice(0,4) }) {
  return <section className="panel p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Task activity</h2><Link to="/tasks" className="text-xs font-semibold text-indigo-600">Open tasks</Link></div><div className="divide-y divide-slate-100">{items.map((task) => <div key={task.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{task.title}</p><p className="mt-1 text-xs text-slate-400">{task.id} · {task.assignee}</p></div><Badge>{task.status}</Badge></div>)}</div></section>;
}
