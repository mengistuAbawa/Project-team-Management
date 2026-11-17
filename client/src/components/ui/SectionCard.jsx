export function SectionCard({ title, description, actions, children }) {
  return <section className="panel overflow-hidden"><div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center"><div><h2 className="font-bold text-slate-900">{title}</h2>{description && <p className="mt-1 text-xs text-slate-500">{description}</p>}</div>{actions}</div>{children}</section>;
}
