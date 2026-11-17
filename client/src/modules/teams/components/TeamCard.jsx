export function TeamCard({team}){return <div className="panel p-4"><h3 className="font-semibold">{team.name}</h3><p className="text-sm text-slate-500">{team.lead} · {team.members} members</p></div>;}
