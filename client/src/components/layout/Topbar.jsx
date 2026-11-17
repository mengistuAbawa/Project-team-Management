import { Bell, LogOut, Menu, Moon, Search, Sun } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider.jsx';
import { useTheme } from '../../app/providers/useTheme.js';
import { ROLE_LABELS } from '../../config/roles.js';
import { Avatar } from '../ui/Avatar.jsx';

export function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const title = location.pathname.split('/')[1]?.replace(/-/g, ' ') || 'Dashboard';
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-slate-100/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
          className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
        >
          <Menu size={19} />
        </button>
        <div className="min-w-0">
          <p className="truncate text-xs capitalize text-slate-400">Workspace / {title}</p>
          <p className="truncate text-sm font-bold capitalize text-slate-800">{title}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 md:flex">
          <Search size={16} className="text-slate-400" />
          <input className="w-36 bg-transparent text-sm outline-none" placeholder="Search workspace" />
        </div>
        <button
          type="button"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          onClick={toggleTheme}
          className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <Link to="/notifications" aria-label="Notifications" className="relative rounded-xl p-2 text-slate-500 transition hover:bg-slate-100">
          <Bell size={19} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </Link>
        <div className="hidden items-center gap-2 sm:flex">
          <Avatar name={user?.name} />
          <div><p className="text-xs font-bold text-slate-800">{user?.name}</p><p className="text-[10px] text-slate-500">{ROLE_LABELS[user?.role]}</p></div>
        </div>
        <button
          type="button"
          title="Sign out"
          aria-label="Sign out"
          onClick={() => { logout(); navigate('/login'); }}
          className="rounded-xl p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
