import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
export function NotificationBell({count=0}){return <Link to="/notifications" className="relative inline-flex rounded-lg p-2"><Bell size={18}/>{count>0&&<span className="absolute right-0 top-0 rounded-full bg-rose-500 px-1 text-[9px] text-white">{count}</span>}</Link>;}
