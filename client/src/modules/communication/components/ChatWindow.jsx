export function ChatWindow({messages=[]}){return <div className="space-y-3">{messages.map(m=><p key={m.id} className="rounded-xl bg-slate-50 p-3 text-sm">{m.text}</p>)}</div>;}
