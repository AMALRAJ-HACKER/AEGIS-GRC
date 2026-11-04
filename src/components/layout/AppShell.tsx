import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  ShieldCheck,
  AlertTriangle,
  CheckSquare,
  Sparkles,
  FolderOpen,
  FileBarChart,
  ScrollText,
  User,
  Settings as SettingsIcon,
  Bell,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/frameworks', label: 'Frameworks', icon: ShieldCheck },
  { to: '/risks', label: 'Risk Register', icon: AlertTriangle },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/audit-log', label: 'Audit Log', icon: ScrollText },
  { to: '/evidence', label: 'Evidence Library', icon: FolderOpen },
  { to: '/reports', label: 'Reports & Audit', icon: FileBarChart },
  { to: '/ai', label: 'AI Assistant', icon: Sparkles },
];

interface NavItemProps {
  to: string;
  label?: string;
  icon: any;
}

function NavItem({
  to,
  label,
  icon,
}: NavItemProps) {
  const isActive = useLocation().pathname === to;
  const classes = isActive
    ? 'bg-navy text-navy-dark dark:bg-navy/20 dark:text-navy'
    : 'text-slate-600 hover:bg-navy-light dark:hover:bg-navy/20 dark:text-navy hover:text-navy';
  return (
    <NavLink
      to={to}
      className={`flex items-center gap-3 rounded-lg px-4 py-2 text-medium transition-colors focus-ring ${classes}`}
    >
      {React.createElement(icon, { size: 18, stroke: 'currentColor' })}
      <span>{label}</span>
    </NavLink>
  );
}

export function AppShell() {
  const isDashboard = useLocation().pathname === '/dashboard';

  return (
    <div className="min-h-screen bg-canvas">
      {/* Left Sidebar */}
      <nav className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-border-focus/10">
        <div className="flex h-16 items-center justify-between px-4 pb-2 border-b border-border-focus/10">
          <h2 className="font-bold text-navy">AEGIS GRC</h2>
        </div>

        <div className="flex-1 px-3 pt-2 space-y-1">
          <div>
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} />
            ))}
          </div>
          <div className="mt-4">
            <NavItem to="/evidence" icon={FolderOpen} />
            <NavItem to="/reports" icon={FileBarChart} />
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-border-focus/10">
          <div className="text-xs text-slate-500">AEGIS GRC</div>
          <button
            className="w-full rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-navy/5 focus-ring mt-2"
            aria-label="Sign out"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Top App Bar */}
      <header
        className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border-focus/10 bg-white px-4 lg:px-6"
      >
        <div className="flex items-center gap-4">
          <NavLink
            to="/dashboard"
            className={isDashboard
              ? 'bg-navy/5 text-navy'
              : 'text-slate-500 hover:bg-navy-light'}
          >
            <ShieldCheck size={16} stroke="currentColor" />
            <span className="font-medium">Dashboard</span>
          </NavLink>

          <input
            type="text"
            placeholder="Search..."
            className="flex-1 rounded-lg border border-border-focus/25 px-3 py-1.5 text-sm focus-ring outline-none"
            style={{ maxWidth: 280 }}
          />
        </div>

        <div className="flex items-center gap-3">
          <Bell size={18} stroke="currentColor" className="text-slate-500 hover:text-crimson" />
          <img
            className="h-8 w-8 rounded-full object-cover"
            src="https://ui-avatars.com/?name=AEGIS+GRC+User&background=0F2D52&color=FFFFFF&bold=true"
            alt="User"
          />
          <span className="text-sm font-medium text-slate-600">User</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="ml-64 lg:ml-64">
        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}