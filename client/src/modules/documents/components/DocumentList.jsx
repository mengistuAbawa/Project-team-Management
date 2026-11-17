export function DocumentList({documents=[]}){return <ul className="space-y-2">{documents.map(d=><li key={d.id} className="text-sm">{d.name}</li>)}</ul>;}
