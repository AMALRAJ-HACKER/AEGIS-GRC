import { useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  ListChecks,
  AlertTriangle,
  ClipboardCheck,
  CheckSquare,
  FolderOpen,
  Boxes,
  Building2,
  Sparkles,
  Settings as SettingsIcon,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentOrg } from '@/hooks/useOrg';
import { roleLabel } from '@/lib/format';
import { Avatar } from '@/components/ui/Avatar';

type NavEntry = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
};

type NavGroup = { heading: string; items: NavEntry[] };

const NAV_GROUPS: NavGroup[] = [
  {
    heading: 'Overview',
    items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    heading: 'Compliance',
    items: [
      { to: '/frameworks', label: 'Frameworks', icon: ShieldCheck },
      { to: '/controls', label: 'Controls', icon: ListChecks },
      { to: '/risks', label: 'Risk Register', icon: AlertTriangle },
      { to: '/reports', label: 'Audits & Reports', icon: ClipboardCheck },
    ],
  },
  {
    heading: 'Operations',
    items: [
      { to: '/tasks', label: 'Tasks', icon: CheckSquare },
      { to: '/evidence', label: 'Evidence Library', icon: FolderOpen },
      { to: '/assets', label: 'Assets', icon: Boxes },
      { to: '/vendors', label: 'Vendors', icon: Building2 },
    ],
  },
  {
    heading: 'Intelligence',
    items: [{ to: '/ai', label: 'AI Assistant', icon: Sparkles }],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

function NavRow({ item, onNavigate }: { item: NavEntry; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-navy text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-navy'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={18} strokeWidth={1.9} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-navy'} />
          <span className="truncate">{item.label}</span>
          {isActive && <ChevronRight size={14} className="ml-auto text-white/60" />}
        </>
      )}
    </NavLink>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { data: orgCtx } = useCurrentOrg();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-line px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-white">
          <ShieldCheck size={20} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight text-navy">AEGIS GRC</p>
          <p className="truncate text-[11px] leading-tight text-slate-400">
            {orgCtx?.org?.name ?? 'Compliance Platform'}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="thin-scroll flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.heading}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {group.heading}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavRow key={item.to} item={item} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 space-y-1 border-t border-line px-3 py-4">
        <NavRow
          item={{ to: '/settings', label: 'Settings', icon: SettingsIcon }}
          onNavigate={onNavigate}
        />
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-crimson"
        >
          <LogOut size={18} strokeWidth={1.9} className="text-slate-400" />
          Sign out
        </button>
      </div>
    </div>
  );
}

function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { data: orgCtx } = useCurrentOrg();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ALL_ITEMS.filter((i) => i.label.toLowerCase().includes(q)).slice(0, 5);
  }, [query]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (matches[0]) {
      navigate(matches[0].to);
      setQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6">
      <button
        onClick={onOpenMenu}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={20} stroke="currentColor" />
      </button>

      {/* Search */}
      <form onSubmit={submitSearch} className="relative w-full max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pages, controls, risks…"
          className="w-full rounded-lg border border-line bg-slate-50 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-slate-400 focus:border-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue/15"
        />
        {matches.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-xl border border-line bg-white shadow-pop">
            {matches.map((m) => (
              <button
                key={m.to}
                type="button"
                onClick={() => {
                  navigate(m.to);
                  setQuery('');
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-navy"
              >
                <m.icon size={15} className="text-slate-400" />
                {m.label}
              </button>
            ))}
          </div>
        )}
      </form>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
        <NavLink
          to="/notifications"
          className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-navy"
          aria-label="Notifications"
        >
          <Bell size={19} strokeWidth={1.9} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-crimson ring-2 ring-white" />
        </NavLink>

        <div className="hidden h-8 w-px bg-line sm:block" />

        <NavLink
          to="/profile"
          className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-1 transition-colors hover:bg-slate-100 sm:pr-3"
        >
          <Avatar name={orgCtx?.profile?.full_name} url={orgCtx?.profile?.avatar_url} size={32} />
          <span className="hidden min-w-0 text-left sm:block">
            <span className="block truncate text-xs font-semibold text-navy">
              {orgCtx?.profile?.full_name ?? 'Account'}
            </span>
            <span className="block truncate text-[11px] text-slate-400">
              {roleLabel(orgCtx?.role ?? 'staff')}
            </span>
          </span>
        </NavLink>
      </div>
    </header>
  );
}

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-line bg-white lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-navy/40 backdrop-blur-[2px]"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-pop">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              aria-label="Close navigation"
            >
              <X size={18} stroke="currentColor" />
            </button>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        <Topbar onOpenMenu={() => setDrawerOpen(true)} />
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
        <footer className="border-t border-line px-4 py-4 text-center text-[11px] text-slate-400 sm:px-6">
          AEGIS GRC · Governance, Risk &amp; Compliance · Light mode
        </footer>
      </div>
    </div>
  );
}
