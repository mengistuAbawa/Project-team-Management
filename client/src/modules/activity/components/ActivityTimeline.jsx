export function ActivityTimeline({items=[]}){return <ol className="space-y-4">{items.map(item=><li key={item.id} className="text-sm">{item.actor} {item.action} {item.target}</li>)}</ol>;}
