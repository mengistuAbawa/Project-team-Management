import { Badge } from './Badge.jsx';
export function FeatureTable({ columns, rows, empty = 'No records found.' }) {
  if (!rows.length) return <div className="p-8 text-center text-sm text-slate-500">{empty}</div>;
  return <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400"><tr>{columns.map((c)=><th key={c.key} className="px-5 py-3 font-semibold">{c.label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row)=><tr key={row.id} className="hover:bg-slate-50/70">{columns.map((c)=><td key={c.key} className="px-5 py-4 text-slate-600">{c.badge ? <Badge>{row[c.key]}</Badge> : (row[c.key] ?? '—')}</td>)}</tr>)}</tbody></table></div>;
}
