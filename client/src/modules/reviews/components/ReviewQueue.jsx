export function ReviewQueue({items=[]}){return <ul className="space-y-2">{items.map(i=><li key={i.id} className="text-sm">{i.item} — {i.status}</li>)}</ul>;}
