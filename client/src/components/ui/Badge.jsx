const palettes = {
  'In progress': 'bg-blue-50 text-blue-700', 'Completed': 'bg-emerald-50 text-emerald-700',
  'Done': 'bg-emerald-50 text-emerald-700', 'In review': 'bg-violet-50 text-violet-700',
  'Review': 'bg-violet-50 text-violet-700', 'Todo': 'bg-slate-100 text-slate-600',
  'High': 'bg-rose-50 text-rose-700', 'Urgent': 'bg-rose-100 text-rose-800',
  'Medium': 'bg-amber-50 text-amber-700', 'Low': 'bg-slate-100 text-slate-600',
  'Active': 'bg-emerald-50 text-emerald-700', 'On hold': 'bg-amber-50 text-amber-700',
};
export function Badge({ children }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${palettes[children] || 'bg-slate-100 text-slate-600'}`}>{children}</span>;
}
