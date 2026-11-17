import { Clock3 } from 'lucide-react';
export function ActivityFeed({ items = [] }) {
  return <section className="panel p-5"><div className="mb-5 flex items-center justify-between"><h2 className="font-bold text-slate-900">Recent activity</h2><Clock3 size={17} className="text-slate-400"/></div><div className="space-y-5">{items.map((item) => <div key={item.id} className="flex gap-3"><div className="mt-1 h-2 w-2 rounded-full bg-indigo-500 ring-4 ring-indigo-50"/><div className="min-w-0"><p className="text-sm text-slate-700"><span className="font-semibold">{item.actor}</span> {item.action} <span className="font-semibold">{item.target}</span></p><p className="mt-1 text-xs text-slate-400">{item.time}</p></div></div>)}</div></section>;
}
