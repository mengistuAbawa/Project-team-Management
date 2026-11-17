import {
  Activity,
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  CheckSquare,
  Circle,
  CircleUserRound,
  ClipboardCheck,
  Files,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Settings,
  UserRoundCog,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { navigation } from '../../config/navigation.js';
import { useAuth } from '../../app/providers/AuthProvider.jsx';

const icons = {
  Activity,
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  CheckSquare,
  CircleUserRound,
  ClipboardCheck,
  Files,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Settings,
  UserRoundCog,
  Users,
};

export function Sidebar({ isMobileOpen = false, onClose = () => {} }) {
  const { user } = useAuth();
  return (
    <aside className={`fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-[#1e3a8a] bg-[#172554] transition-transform duration-200 lg:flex ${isMobileOpen ? 'flex translate-x-0' : 'hidden -translate-x-full lg:translate-x-0'}`}>
      <NavLink to="/dashboard" onClick={onClose} className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-lg font-black text-white">T</span>
        <div><p className="font-extrabold tracking-tight text-white">TeamFlow</p><p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200">Workspace</p></div>
      </NavLink>
      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Dashboard navigation">
        <div className="space-y-1">
          {navigation.flatMap((group) => group.items)
            .filter((item) => item.roles.includes(user?.role))
            .map((item) => {
              const Icon = icons[item.icon] || Circle;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-blue-500/25 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}
                >
                  <Icon size={18} />{item.label}
                </NavLink>
              );
            })}
        </div>
      </nav>
    </aside>
  );
}
