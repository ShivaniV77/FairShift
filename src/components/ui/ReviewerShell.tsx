import { type ReactNode } from 'react';
import {
  ShieldCheck,
  RotateCcw,
  LogOut,
  Gavel,
  Scale,
} from 'lucide-react';
import type { NavKey } from './AppShell';
import type { Session } from '../../types';
import Button from './Button';

interface Props {
  session: Session;
  nav: NavKey;
  onNav: (n: NavKey) => void;
  navItems: Array<{ key: NavKey; label: string; icon: typeof Gavel }>;
  onReset: () => void;
  onLogout: () => void;
  children: ReactNode;
}

export default function ReviewerShell({
  session,
  nav,
  onNav,
  navItems,
  onReset,
  onLogout,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-violet-50/30 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-violet-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
              <Scale className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-bold tracking-tight">FairShift · Review</h1>
              <p className="text-[11px] text-slate-500">Independent complaints review centre</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm">
              <Gavel className="h-4 w-4 text-violet-600" />
              <span className="font-medium text-slate-700">{session.displayName}</span>
              <span className="text-xs text-slate-400">· Reviewer</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onReset} aria-label="Reset demo data">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <nav className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto pb-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.key === nav;
              return (
                <button
                  key={item.key}
                  onClick={() => onNav(item.key)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-300'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white">
            <Gavel className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-violet-600">
              Reviewer overview
            </p>
            <h2 className="text-xl font-semibold">All complaints across every industry</h2>
          </div>
        </div>
        {children}
      </main>

      <footer className="border-t border-violet-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-slate-400 sm:px-6">
          FairShift Review · Your trusted platform
        </div>
      </footer>
    </div>
  );
}
