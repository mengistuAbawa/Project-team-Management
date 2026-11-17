import { Search } from 'lucide-react';
export function SearchField({ value, onChange, placeholder = 'Search...' }) {
  return <div className="relative"><Search size={16} className="absolute left-3 top-3 text-slate-400"/><input className="form-input pl-9" value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder}/></div>;
}
