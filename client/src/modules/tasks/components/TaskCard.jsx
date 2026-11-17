import { Badge } from '../../../components/ui/Badge.jsx';
export function TaskCard({task}){return <article className="panel p-4"><div className="flex justify-between gap-2"><h3 className="font-semibold">{task.title}</h3><Badge>{task.priority}</Badge></div><p className="mt-2 text-xs text-slate-500">{task.project} · {task.assignee}</p></article>;}
