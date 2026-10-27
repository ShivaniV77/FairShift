import { useState } from 'react';
import {
  ShieldCheck,
  HardHat,
  Stethoscope,
  Gavel,
  LogIn,
  AlertCircle,
  Eye,
  Building2,
  ArrowRight,
  ArrowLeft,
  Wrench,
  HeartPulse,
  Wallet,
  ShieldAlert,
  Users,
  Home,
  Mail,
  Menu,
  X,
} from 'lucide-react';
import type { AppStore } from '../store/useAppStore';
import type { Industry, Role } from '../types';
import { industryMeta } from '../data/sampleData';
import Button from './ui/Button';
import CaseChecker from './CaseChecker';

interface Props {
  store: AppStore;
}

type View = 'landing' | 'portal' | 'login' | 'reviewer';

const features = [
  {
    icon: Wallet,
    title: 'Transparent Pay',
    desc: 'Clear breakdowns of hours, overtime and deductions — no surprises on payday.',
    accent: 'from-teal-400 to-teal-600',
    soft: 'bg-teal-50',
  },
  {
    icon: ShieldAlert,
    title: 'Anonymous Complaints',
    desc: 'Report hazards safely and anonymously. Every voice is heard and protected.',
    accent: 'from-violet-400 to-violet-600',
    soft: 'bg-violet-50',
  },
  {
    icon: Users,
    title: 'Fair Management',
    desc: 'Track attendance, overtime and workforce wellbeing in one calm dashboard.',
    accent: 'from-sky-400 to-sky-600',
    soft: 'bg-sky-50',
  },
  {
    icon: ShieldCheck,
    title: 'Safer Workplaces',
    desc: 'Fatigue alerts, PPE tracking and an independent review centre for every site.',
    accent: 'from-emerald-400 to-emerald-600',
    soft: 'bg-emerald-50',
  },
];

const roleLabels: Record<Role, { title: string; desc: string; icon: typeof LogIn }> = {
  worker: { title: 'Worker', desc: 'Check in, see your pay, report hazards', icon: HardHat },
  employer: { title: 'Employer', desc: 'Manage attendance, overtime and complaints', icon: Building2 },
  reviewer: { title: 'Reviewer', desc: 'Review and resolve safety complaints', icon: Gavel },
};

const sampleAccounts: Record<Industry, Array<{ role: Role; user: string; pass: string; label: string }>> = {
  construction: [
    { role: 'worker', user: 'ramesh kumar', pass: 'ram123', label: 'Ramesh Kumar — Mason' },
    { role: 'worker', user: 'sita devi', pass: 'sit123', label: 'Sita Devi — Site Helper' },
    { role: 'worker', user: 'imran sheikh', pass: 'imr123', label: 'Imran Sheikh — Scaffolder' },
    { role: 'worker', user: 'lakshmi n.', pass: 'lak123', label: 'Lakshmi N. — Crane Operator' },
    { role: 'employer', user: 'arjun', pass: 'arj123', label: 'Arjun — Site Manager' },
  ],
  hospital: [
    { role: 'worker', user: 'anjali rao', pass: 'anj123', label: 'Anjali Rao — Nursing Assistant' },
    { role: 'worker', user: 'joseph thomas', pass: 'jos123', label: 'Joseph Thomas — Patient Support' },
    { role: 'worker', user: 'fatima begum', pass: 'fat123', label: 'Fatima Begum — Waste Handling' },
    { role: 'worker', user: 'mohit verma', pass: 'moh123', label: 'Mohit Verma — Laundry Technician' },
    { role: 'employer', user: 'neha', pass: 'neh123', label: 'Dr. Neha — Hospital Admin' },
  ],
};

const reviewerAccount = { user: 'reviewer', pass: 'pri123', label: 'Priya Menon — Complaints Reviewer' };

const maskPass = (p: string) => '•'.repeat(Math.max(4, p.length));

export default function LoginPage({ store }: Props) {
  const { login } = store;
  const [view, setView] = useState<View>('landing');
  const [industry, setIndustry] = useState<Industry>('construction');
  const [role, setRole] = useState<Role>('worker');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isConstruction = industry === 'construction';
  const meta = industryMeta[industry];

  const enterPortal = (ind: Industry, asRole: Role = 'worker') => {
    setIndustry(ind);
    setRole(asRole);
    setUsername('');
    setPassword('');
    setError(null);
    setView('login');
  };

  const goToPortals = () => {
    setUsername('');
    setPassword('');
    setError(null);
    setView('portal');
  };

  const backToPortals = () => {
    setView('portal');
    setUsername('');
    setPassword('');
    setError(null);
  };

  const enterReviewer = () => {
    setView('reviewer');
    setUsername('');
    setPassword('');
    setError(null);
  };

  const fillSample = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  const tryLogin = (u: string, p: string) => {
    setError(null);
    const res = login(u, p);
    if (!res.ok) setError(res.error ?? 'Login failed.');
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    tryLogin(username, password);
  };

  // ---- Landing page (dark-mode info / introduction) ----
  if (view === 'landing') {
    const heroImg = '/images/hero.jpg';
    const aboutImg = '/images/about.jpg';
    const industryImgs = [
      { src: '/images/construction.jpg', label: 'Construction', icon: HardHat },
      { src: '/images/healthcare.jpg', label: 'Healthcare', icon: HeartPulse },
      { src: '/images/hospitality.jpg', label: 'Hospitality', icon: Users },
      { src: '/images/emergency.jpg', label: 'Emergency Services', icon: ShieldCheck },
    ];

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <a href="#top" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-violet-500 text-white shadow-lg shadow-violet-500/20">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="leading-tight">
                <span className="block text-lg font-bold tracking-tight text-white">FairShift</span>
                <span className="block text-[11px] font-medium text-slate-400">Fair Work. Better Tomorrow.</span>
              </span>
            </a>

            <nav className="hidden items-center gap-1 md:flex">
              {[
                { label: 'Home', href: '#top' },
                { label: 'About', href: '#about' },
                { label: 'Features', href: '#features' },
                { label: 'Contact', href: '#contact' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="hidden md:block">
              <Button
                size="sm"
                className="bg-gradient-to-r from-teal-500 to-violet-600 text-white hover:from-teal-400 hover:to-violet-500"
                onClick={goToPortals}
              >
                Get Started
              </Button>
            </div>

            <button
              className="rounded-lg p-2 text-slate-300 md:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {menuOpen && (
            <div className="border-t border-white/5 bg-slate-950 px-4 py-3 md:hidden">
              <nav className="flex flex-col gap-1">
                {[
                  { label: 'Home', href: '#top' },
                  { label: 'About', href: '#about' },
                  { label: 'Features', href: '#features' },
                  { label: 'Contact', href: '#contact' },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5"
                  >
                    {item.label}
                  </a>
                ))}
                <Button
                  size="sm"
                  className="mt-2 bg-gradient-to-r from-teal-500 to-violet-600 text-white"
                  onClick={() => { setMenuOpen(false); goToPortals(); }}
                >
                  Get Started
                </Button>
              </nav>
            </div>
          )}
        </header>

        {/* Hero */}
        <section id="top" className="relative overflow-hidden">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-20 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-teal-300">
                <ShieldCheck className="h-3.5 w-3.5" /> Built for workers &amp; employers
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                Fair Work Builds{' '}
                <span className="bg-gradient-to-r from-teal-400 to-violet-500 bg-clip-text text-transparent">
                  Stronger Communities
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                FairShift empowers workers and employers with transparency, security and trust — because
                every job deserves fairness.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 ring-1 ring-white/10">
                  <HeartPulse className="h-4 w-4 text-rose-400" /> Healthcare
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 ring-1 ring-white/10">
                  <HardHat className="h-4 w-4 text-amber-400" /> Construction
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 ring-1 ring-white/10">
                  <Users className="h-4 w-4 text-teal-400" /> Hospitality &amp; more
                </span>
              </div>

              <p className="mt-8 max-w-md font-[cursive] text-lg italic text-violet-400">
                “Same rights. Same value.”
              </p>
            </div>

            <div className="relative">
              <div className="absolute -right-4 -top-4 z-10 hidden rounded-2xl bg-teal-500/20 px-4 py-2 text-xs font-medium text-teal-200 ring-1 ring-teal-500/30 backdrop-blur sm:block">
                Transparent pay
              </div>
              <div className="absolute -left-4 bottom-8 z-10 hidden rounded-2xl bg-violet-500/20 px-4 py-2 text-xs font-medium text-violet-200 ring-1 ring-violet-500/30 backdrop-blur sm:block">
                Safer shifts
              </div>
              <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-violet-900/30">
                <img
                  src={heroImg}
                  alt="Construction workers at sunset"
                  className="w-full object-cover opacity-60"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-10 rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Why <span className="bg-gradient-to-r from-teal-400 to-violet-500 bg-clip-text text-transparent">FairShift</span>?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-300">
                FairShift is a calm, trustworthy platform that brings workers and employers onto the same
                page. From transparent pay calculations to anonymous hazard reporting and an independent
                review centre, we make fairness visible — across construction, healthcare, hospitality and
                beyond.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-200">
                {[
                  'Clear, verifiable pay breakdowns for every shift',
                  'Anonymous complaint flow protected from retaliation',
                  'Independent reviewer with a full audit trail',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-violet-500 text-white">
                      <ShieldCheck className="h-3 w-3" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-xl">
                <img
                  src={aboutImg}
                  alt="Team of workers in reflective vests"
                  className="w-full object-cover opacity-55"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/20" />
              </div>
            </div>
          </div>
        </section>

        {/* Industries gallery */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white">Every industry deserves fairness</h2>
            <p className="mt-2 text-sm text-slate-400">From the building site to the hospital ward.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {industryImgs.map((ind) => {
              const Icon = ind.icon;
              return (
                <div key={ind.label} className="group relative overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src={ind.src}
                    alt={ind.label}
                    className="h-44 w-full object-cover opacity-50 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-70"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 text-sm font-semibold text-white">
                    <Icon className="h-4 w-4 text-teal-400" />
                    {ind.label}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">Everything fairness needs</h2>
            <p className="mt-2 text-sm text-slate-400">Four calm, focused tools that make work better.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-3xl border border-white/10 bg-white/5 p-6 transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
                >
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.accent} text-white shadow-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Stats band */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-teal-500/10 to-violet-500/10 p-6 text-center">
              <p className="text-4xl font-bold text-white">2</p>
              <p className="mt-1 text-sm text-slate-400">Industry portals</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-sky-500/10 p-6 text-center">
              <p className="text-4xl font-bold text-white">4</p>
              <p className="mt-1 text-sm text-slate-400">Core features</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-sky-500/10 to-teal-500/10 p-6 text-center">
              <p className="text-4xl font-bold text-white">100%</p>
              <p className="mt-1 text-sm text-slate-400">Anonymous reports</p>
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-500 via-violet-500 to-violet-600 p-10 text-center text-white shadow-2xl shadow-violet-900/40 sm:p-14">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <h2 className="text-3xl font-bold tracking-tight">Ready to make fairness visible?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/90">
              Explore the portal and see shifts, pay and complaints in one calm place.
            </p>
            <button
              onClick={goToPortals}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-violet-700 shadow-lg transition-all hover:-translate-y-0.5"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* Footer / contact */}
        <footer id="contact" className="border-t border-white/5 bg-slate-950">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-violet-500 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <span className="text-lg font-bold text-white">FairShift</span>
              </div>
              <p className="mt-3 max-w-xs text-sm text-slate-400">
                Fair Work. Better Tomorrow. A calm, trustworthy platform for workers and employers.
              </p>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Explore</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#top" className="hover:text-white">Home</a></li>
                <li><a href="#about" className="hover:text-white">About</a></li>
                <li><a href="#features" className="hover:text-white">Features</a></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Get in touch</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-teal-400" /> hello@fairshift.app</li>
                <li className="flex items-center gap-2"><Home className="h-4 w-4 text-violet-400" /> Built for every workplace</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 px-4 py-5 text-center text-xs text-slate-600 sm:px-6">
            FairShift · Demo prototype · Fair Work. Better Tomorrow.
          </div>
        </footer>
      </div>
    );
  }

  // ---- Portal selection screen (original) ----
  if (view === 'portal') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-10 sm:px-6">
          <button
            onClick={() => setView('landing')}
            className="mb-6 inline-flex items-center gap-2 self-start text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </button>

          <header className="mb-10 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-600 text-white shadow-lg">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">FairShift</h1>
            <p className="mt-2 text-base font-medium text-slate-600">Your trusted platform</p>
            <p className="mt-3 max-w-lg text-sm text-slate-500">
              Choose your workplace portal to continue. Each has its own dashboard, tools and safety flows.
            </p>
          </header>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Construction portal */}
            <button
              onClick={() => enterPortal('construction')}
              className="group relative overflow-hidden rounded-3xl border border-amber-300 bg-white p-8 text-left shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400" />
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md">
                <HardHat className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Construction</h2>
              <p className="mt-2 text-sm text-slate-600">
                Site workforce, overtime &amp; hazard monitoring. PPE tracking, trade-specific tasks and
                scaffold safety.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                  <Wrench className="h-3 w-3" /> PPE checklist
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
                  <Building2 className="h-3 w-3" /> Site oversight
                </span>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-amber-700 group-hover:text-amber-800">
                Enter construction portal
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>

            {/* Hospital portal */}
            <button
              onClick={() => enterPortal('hospital')}
              className="group relative overflow-hidden rounded-3xl border border-blue-300 bg-white p-8 text-left shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500" />
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
                <Stethoscope className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Hospital</h2>
              <p className="mt-2 text-sm text-slate-600">
                Day / night shift coverage, ward safety &amp; fatigue alerts. Infection control and
                patient-support workflows.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  <HeartPulse className="h-3 w-3" /> Ward coverage
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-800">
                  <Building2 className="h-3 w-3" /> Shift oversight
                </span>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-700 group-hover:text-blue-800">
                Enter hospital portal
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          </div>

          {/* Reviewer direct access */}
          <div className="mt-6 flex flex-col items-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
              Independent reviewer access
            </p>
            <button
              onClick={enterReviewer}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-5 py-2.5 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-100"
            >
              <Gavel className="h-4 w-4" />
              Reviewer login
            </button>
          </div>

          <div className="mt-10">
            <h3 className="mb-3 text-center text-sm font-semibold uppercase tracking-wide text-slate-400">
              Track a complaint without logging in
            </h3>
            <CaseChecker store={store} />
          </div>

          <footer className="mt-auto pt-8 text-center text-xs text-slate-400">
            FairShift · Your trusted platform
          </footer>
        </div>
      </div>
    );
  }

  // ---- Reviewer login form ----
  if (view === 'reviewer') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50/40 to-slate-100 text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-10 sm:px-6">
          <button
            onClick={backToPortals}
            className="mb-6 inline-flex items-center gap-2 self-start text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to portals
          </button>

          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 text-white shadow-lg">
              <Gavel className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Reviewer portal</h1>
            <p className="mt-1 text-sm text-slate-600">Independent complaint review &amp; resolution</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Reviewer login</h2>
            <p className="mt-1 text-sm text-slate-500">Sign in to triage and resolve safety complaints.</p>

            <form onSubmit={submit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="username" className="mb-1 block text-sm font-medium text-slate-700">
                  Username
                </label>
                <input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                  placeholder="reviewer"
                  className="w-full rounded-lg border border-violet-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="off"
                    placeholder="your password"
                    className="w-full rounded-lg border border-violet-300 px-3 py-2 pr-10 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg">
                <LogIn className="h-4 w-4" />
                Sign in as reviewer
              </Button>
            </form>

            <div className="mt-5 rounded-lg border border-violet-200 bg-violet-50/60 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Demo reviewer account (click to fill)
              </p>
              <button
                onClick={() => fillSample(reviewerAccount.user, reviewerAccount.pass)}
                className="flex w-full items-center justify-between gap-2 rounded-md bg-white px-3 py-2 text-left text-xs ring-1 ring-slate-200 hover:ring-slate-400"
              >
                <span className="min-w-0">
                  <span className="block font-medium text-slate-800">{reviewerAccount.label}</span>
                  <span className="block text-slate-500">
                    user: <span className="font-mono">{reviewerAccount.user}</span> · pass:{' '}
                    <span className="font-mono tracking-widest">{maskPass(reviewerAccount.pass)}</span>
                  </span>
                </span>
              </button>
            </div>
          </div>

          <footer className="mt-auto pt-8 text-center text-xs text-slate-400">
            FairShift · Your trusted platform
          </footer>
        </div>
      </div>
    );
  }

  // ---- Login form for a chosen portal ----
  const availableRoles: Role[] = ['worker', 'employer'];
  const roleSamples = sampleAccounts[industry].filter((a) => a.role === role);

  return (
    <div className={`min-h-screen text-slate-900 ${isConstruction ? 'bg-amber-50/40' : 'bg-blue-50/30'}`}>
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-10 sm:px-6">
        <button
          onClick={backToPortals}
          className="mb-6 inline-flex items-center gap-2 self-start text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to portals
        </button>

        {/* Portal header */}
        <div className="mb-8 text-center">
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg ${meta.headerBg}`}
          >
            {isConstruction ? <HardHat className="h-8 w-8" /> : <Stethoscope className="h-8 w-8" />}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{meta.label} portal</h1>
          <p className="mt-1 text-sm text-slate-600">{meta.tagline}</p>
        </div>

        {/* Role toggle */}
        <div
          className={`mb-5 grid grid-cols-2 gap-2 rounded-xl border p-1.5 ${
            isConstruction ? 'border-amber-200 bg-amber-50' : 'border-blue-200 bg-blue-50'
          }`}
        >
          {availableRoles.map((r) => {
            const Icon = roleLabels[r].icon;
            const active = r === role;
            return (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  setUsername('');
                  setPassword('');
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? isConstruction
                      ? 'bg-white text-amber-800 shadow-sm ring-1 ring-amber-300'
                      : 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {roleLabels[r].title}
              </button>
            );
          })}
        </div>

        {/* Login form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{roleLabels[role].title} login</h2>
          <p className="mt-1 text-sm text-slate-500">{roleLabels[role].desc}</p>

          <form onSubmit={submit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="username" className="mb-1 block text-sm font-medium text-slate-700">
                Username
              </label>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                placeholder="e.g. ramesh kumar"
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  isConstruction
                    ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500'
                    : 'border-blue-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                  placeholder="your password"
                  className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 ${
                    isConstruction
                      ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500'
                      : 'border-blue-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
            >
              <LogIn className="h-4 w-4" />
              Sign in to {meta.label}
            </Button>
          </form>

          {/* Demo credentials */}
          <div
            className={`mt-5 rounded-lg border p-3 ${
              isConstruction ? 'border-amber-200 bg-amber-50/60' : 'border-blue-200 bg-blue-50/60'
            }`}
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {meta.label} accounts (click to fill)
            </p>
            <div className="space-y-2">
              {roleSamples.map((s) => (
                <button
                  key={s.user}
                  onClick={() => fillSample(s.user, s.pass)}
                  className="flex w-full items-center justify-between gap-2 rounded-md bg-white px-3 py-2 text-left text-xs ring-1 ring-slate-200 hover:ring-slate-400"
                >
                  <span className="min-w-0">
                    <span className="block font-medium text-slate-800">{s.label}</span>
                    <span className="block text-slate-500">
                      user: <span className="font-mono">{s.user}</span> · pass:{' '}
                      <span className="font-mono tracking-widest">{maskPass(s.pass)}</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="mt-auto pt-8 text-center text-xs text-slate-400">
          FairShift · Your trusted platform
        </footer>
      </div>
    </div>
  );
}
