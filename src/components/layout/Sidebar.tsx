'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Bot,
  ChartNoAxesCombined,
  Compass,
  Gamepad2,
  Gem,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  School,
  Target,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/roles', label: 'Roles', icon: Target },
  { href: '/chat', label: 'Career Agent', icon: Bot },
  { href: '/games', label: 'Games Lab', icon: Gamepad2 },
  { href: '/results', label: 'Results', icon: ChartNoAxesCombined },
  { href: '/guidance', label: 'Guidance', icon: Compass },
  { href: '/parent', label: 'Parent Zone', icon: BookOpen },
  { href: '/school', label: 'School Hub', icon: School },
  { href: '/pricing', label: 'Plans', icon: Gem },
];

function routeIsActive(pathname: string, href: string) {
  if (pathname === href) return true;
  return href !== '/dashboard' && pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
        isActive
          ? 'surface-panel text-white shadow-lg'
          : 'text-white/70 hover:text-white hover:bg-white/5'
      }`}
    >
      <span className={`grid h-8 w-8 place-items-center rounded-xl border ${isActive ? 'border-primary-300/40 bg-primary-500/20' : 'border-white/10 bg-white/5'} transition-colors`}>
        <Icon className={`h-4 w-4 ${isActive ? 'text-primary-100' : 'text-white/70 group-hover:text-white'}`} />
      </span>
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const { profile, signOut, supabaseConfigured, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
        className="lg:hidden fixed top-4 left-4 z-50 grid h-11 w-11 place-items-center rounded-xl border border-white/20 bg-surface-900/70 text-white shadow-lg backdrop-blur"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/45 lg:hidden"
          aria-label="Close navigation overlay"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`fixed top-0 left-0 z-40 h-full w-72 transform border-r border-white/10 bg-surface-900/85 p-4 backdrop-blur-2xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="surface-panel rounded-3xl p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 via-orange-400 to-accent-500 shadow-lg shadow-black/30">
              <GraduationCap className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <h2 className="font-display text-lg leading-tight text-white">Career Agent</h2>
              <p className="text-xs text-white/70">Designed for student confidence</p>
            </div>
          </div>
          {!supabaseConfigured && (
            <p className="mt-3 inline-flex rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-[11px] font-medium text-amber-100">
              Agent-only mode
            </p>
          )}
          {profile && (
            <p className="mt-3 truncate text-xs text-white/70">{profile.full_name}</p>
          )}
        </div>

        <nav className="mt-4 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={routeIsActive(pathname, item.href)}
            />
          ))}
        </nav>

        {supabaseConfigured && user && (
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
