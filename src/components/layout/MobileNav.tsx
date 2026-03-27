'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  Bot,
  ChartNoAxesCombined,
  Compass,
  Gamepad2,
  Home,
  Target,
} from 'lucide-react';

const mobileNavItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/roles', label: 'Roles', icon: Target },
  { href: '/chat', label: 'Agent', icon: Bot },
  { href: '/games', label: 'Games', icon: Gamepad2 },
  { href: '/results', label: 'Results', icon: ChartNoAxesCombined },
  { href: '/guidance', label: 'Guide', icon: Compass },
];

function isActiveRoute(pathname: string, href: string) {
  if (pathname === href) return true;
  return href !== '/dashboard' && pathname.startsWith(`${href}/`);
}

function NavItem({
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
      className={`flex min-w-[52px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium tracking-wide transition-all ${
        isActive
          ? 'text-white'
          : 'text-white/50 hover:text-white/70'
      }`}
    >
      <span className={`grid h-8 w-8 place-items-center rounded-xl border transition-all ${
        isActive
          ? 'border-primary-300/50 bg-primary-500/25 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
          : 'border-white/10 bg-white/5'
      }`}>
        <Icon className="h-4 w-4" />
      </span>
      <span>{label}</span>
    </Link>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-50 rounded-2xl border border-white/15 bg-surface-900/85 px-2 py-1.5 shadow-[0_12px_35px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <div className="flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const isActive = isActiveRoute(pathname, item.href);
          return (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={isActive}
            />
          );
        })}
      </div>
    </nav>
  );
}
