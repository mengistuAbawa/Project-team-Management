export function TaskAssignees({names=[]}){return <div className="text-xs text-slate-500">{names.join(', ') || 'Unassigned'}</div>;}
