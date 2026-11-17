import { Link } from 'react-router-dom';
export function Breadcrumbs({ items = [] }) {
  return <div className="mb-4 flex gap-2 text-xs text-slate-400">{items.map((item, index) => <span key={item.label}>{index > 0 && '/'} {item.path ? <Link to={item.path} className="hover:text-indigo-600">{item.label}</Link> : item.label}</span>)}</div>;
}
