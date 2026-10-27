import { type ReactNode } from 'react';
import {
  HardHat,
  Stethoscope,
  ShieldCheck,
  RotateCcw,
  LogOut,
  UserCircle2,
  Building2,
  Gavel,
} from 'lucide-react';
import type { Industry, Role, Session } from '../../types';
import { industryMeta } from '../../data/sampleData';
import Button from './Button';

export type NavKey =
  | 'dashboard'
  | 'complaints'
  | 'review'
  | 'addWorker'
  | 'insights';

interface Props {
  session: Session;
  industry: Industry;
  nav: NavKey;
  onNav: (n: NavKey) => void;
  navItems: Array<{ key: NavKey; label: string; icon: typeof UserCircle2 }>;
  onIndustry: (i: Industry) => void;
  onReset: () => void;
  onLogout: () => void;
  children: ReactNode;
}

const iconFor = (name: string) => {
  if (name === 'HardHat') return HardHat;
  if (name === 'Stethoscope') return Stethoscope;
  return HardHat;
};

const roleIcon = (r: Role) => {
  if (r === 'worker') return UserCircle2;
  if (r === 'employer') return Building2;
  return Gavel;
};

const roleLabel = (r: Role) => (r === 'worker' ? 'Worker' : r === 'employer' ? 'Employer' : 'Reviewer');

export default function AppShell({
  session,
  industry,
  nav,
  onNav,
  navItems,
  onIndustry,
  onReset,
  onLogout,
  children,
}: Props) {
  const meta = industryMeta[industry];
  const IndustryIcon = iconFor(meta.icon);
  const RoleIcon = roleIcon(session.role);
  const isConstruction = industry === 'construction';

  // worker + reviewer don't switch industry freely; only employer does
  const canSwitchIndustry = session.role === 'employer';

  return (
    <div className={`min-h-screen text-slate-900 ${isConstruction ? 'bg-amber-50/40' : 'bg-blue-50/30'}`}>
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur ${
          isConstruction ? 'border-amber-200 bg-white/90' : 'border-blue-200 bg-white/90'
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm ${meta.headerBg}`}
            >
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-bold tracking-tight">FairShift</h1>
              <p className="text-[11px] text-slate-500">Your trusted platform</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canSwitchIndustry && (
              <div
                className={`inline-flex rounded-lg border p-1 ${
                  isConstruction ? 'border-amber-200 bg-amber-50' : 'border-blue-200 bg-blue-50'
                }`}
                role="tablist"
                aria-label="Industry"
              >
                {(['construction', 'hospital'] as Industry[]).map((ind) => {
                  const M = iconFor(industryMeta[ind].icon);
                  const active = ind === industry;
                  const otherConstruction = ind === 'construction';
                  return (
                    <button
                      key={ind}
                      role="tab"
                      aria-selected={active}
                      onClick={() => onIndustry(ind)}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        active
                          ? otherConstruction
                            ? 'bg-white text-amber-800 shadow-sm'
                            : 'bg-white text-blue-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <M className="h-4 w-4" />
                      {industryMeta[ind].label}
                    </button>
                  );
                })}
              </div>
            )}

            <div
              className={`inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-sm ${
                isConstruction ? 'border-amber-200' : 'border-blue-200'
              }`}
            >
              <RoleIcon className={`h-4 w-4 ${isConstruction ? 'text-amber-600' : 'text-blue-600'}`} />
              <span className="font-medium text-slate-700">{session.displayName}</span>
              <span className="text-xs text-slate-400">· {roleLabel(session.role)}</span>
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

        {/* Nav row */}
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
                    active ? meta.navActive : meta.navIdle
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
        <div
          className={`mb-6 flex items-center gap-4 rounded-2xl p-5 ${meta.softBg} ${meta.borderTone} border`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm ${meta.headerBg}`}
          >
            <IndustryIcon className="h-6 w-6" />
          </div>
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: meta.accent }}
            >
              {meta.label} {session.role !== 'reviewer' ? 'industry' : 'overview'}
            </p>
            <h2 className="text-xl font-semibold text-slate-900">{meta.tagline}</h2>
          </div>
        </div>
        {children}
      </main>

      <footer
        className={`border-t bg-white ${
          isConstruction ? 'border-amber-200' : 'border-blue-200'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-slate-400 sm:px-6">
          FairShift · Your trusted platform
        </div>
      </footer>
    </div>
  );
}
