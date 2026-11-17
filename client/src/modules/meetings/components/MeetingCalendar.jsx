export function MeetingCalendar({meetings=[]}){return <ul className="space-y-2">{meetings.map(m=><li key={m.id} className="text-sm">{m.date} · {m.title}</li>)}</ul>;}
