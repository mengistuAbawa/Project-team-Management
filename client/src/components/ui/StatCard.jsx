import { TrendingUp } from 'lucide-react';
export function StatCard({ label, value, change, icon: Icon }) {
  return <article className="panel p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p></div><div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">{Icon && <Icon size={20}/>}</div></div><p className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600"><TrendingUp size={14}/>{change || 'Updated recently'}</p></article>;
}
