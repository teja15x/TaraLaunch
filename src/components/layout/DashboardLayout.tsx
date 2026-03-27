'use client';

import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { GlobalLanguageSwitcher } from './GlobalLanguageSwitcher';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell min-h-screen">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="animate-float-slow absolute -top-32 -left-24 h-72 w-72 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="animate-float-slower absolute top-24 right-[-120px] h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="animate-float-slow absolute bottom-[-120px] left-[34%] h-80 w-80 rounded-full bg-rose-400/15 blur-3xl" />
      </div>

      <Sidebar />

      <main className="relative z-10 min-h-screen p-4 pb-24 pt-16 lg:ml-72 lg:p-8 lg:pt-8 lg:pb-8">
        <div className="mb-4 flex justify-end">
          <GlobalLanguageSwitcher />
        </div>
        {children}
      </main>

      <MobileNav />
    </div>
  );
}
