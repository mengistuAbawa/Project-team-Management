import { Inbox } from 'lucide-react';
export function EmptyState({ title = 'Nothing here yet', description = 'New items will appear here when available.' }) {
  return <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center"><Inbox className="mb-3 text-slate-300" size={34}/><h3 className="font-semibold text-slate-800">{title}</h3><p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p></div>;
}
