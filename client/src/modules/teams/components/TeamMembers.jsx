export function TeamMembers({members=[]}){return <ul className="space-y-2">{members.map(m=><li key={m.id} className="text-sm text-slate-600">{m.name} · {m.role}</li>)}</ul>;}
