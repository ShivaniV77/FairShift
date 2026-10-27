import { useMemo, useState } from 'react';
import {
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Timer,
  TrendingUp,
  Activity,
  UserPlus,
  Flag,
  Hourglass,
  Moon,
  Sun,
  Sunset,
  Lightbulb,
} from 'lucide-react';
import type { AppStore } from '../store/useAppStore';
import { calcShift, fatigueRiskFor, isOverdue } from '../store/useAppStore';
import { formatTime, formatDate, formatMoney, formatDateTime } from '../utils/format';
import { shiftType, industryMeta } from '../data/sampleData';
import type { ComplaintStatus, Industry } from '../types';
import Card, { CardHeader } from './ui/Card';
import StatCard from './ui/StatCard';
import Table from './ui/Table';
import Badge, { statusTone, urgencyTone } from './ui/Badge';
import Button from './ui/Button';
import Modal from './ui/Modal';

interface Props {
  store: AppStore;
  industry: Industry;
  onManageComplaints: () => void; // jump to complaints centre
}

const STATUSES: ComplaintStatus[] = ['Submitted', 'Under Review', 'Action Taken', 'Closed'];

const ShiftIcon = ({ industry, start }: { industry: Industry; start: string }) => {
  const h = parseInt(start.slice(0, 2), 10);
  const t = h >= 20 || h < 6 ? 'Night' : h >= 14 ? 'Evening' : 'Day';
  if (t === 'Night') return <Moon className="h-3.5 w-3.5" />;
  if (t === 'Evening') return <Sunset className="h-3.5 w-3.5" />;
  return <Sun className="h-3.5 w-3.5" />;
};

export default function EmployerDashboard({ store, industry, onManageComplaints }: Props) {
  const { state, addWorker, clearPayFlag } = store;
  const [addOpen, setAddOpen] = useState(false);

  const workers = state.workers.filter((w) => w.industry === industry);
  const attendance = state.attendance.filter((a) => a.industry === industry);
  const complaints = state.complaints.filter((c) => c.industry === industry);

  const today = new Date().toISOString().slice(0, 10);
  const meta = industryMeta[industry];

  const stats = useMemo(() => {
    const todayRecords = attendance.filter((a) => a.date === today);
    const presentIds = new Set(todayRecords.map((a) => a.workerId));
    const completedToday = todayRecords.filter((a) => a.checkOut).length;
    let totalOTHours = 0;
    let overworkAlerts = 0;
    const overworkWorkers: Array<{ name: string; hours: number }> = [];
    let weekPay = 0;
    const last7 = new Date();
    last7.setDate(last7.getDate() - 7);
    const fatigueHigh: string[] = [];

    for (const w of workers) {
      const weekRecords = attendance.filter(
        (a) => a.workerId === w.id && a.checkOut && new Date(a.checkIn) >= last7
      );
      for (const r of weekRecords) {
        const s = calcShift(r, w);
        totalOTHours += s.overtimeHours;
        weekPay += s.totalPay;
        if (s.hoursWorked > 10) {
          overworkAlerts++;
          overworkWorkers.push({ name: w.name, hours: s.hoursWorked });
        }
      }
      const fr = fatigueRiskFor(state, w);
      if (fr.level === 'High') fatigueHigh.push(w.name);
    }
    return {
      total: workers.length,
      present: presentIds.size,
      completedToday,
      totalOTHours: Math.round(totalOTHours * 100) / 100,
      overworkAlerts,
      overworkWorkers,
      weekPay: Math.round(weekPay * 100) / 100,
      fatigueHigh,
    };
  }, [workers, attendance, today, state]);

  const openComplaints = complaints.filter((c) => c.status !== 'Closed' && c.status !== 'Action Taken').length;
  const overdueComplaints = complaints.filter(isOverdue);
  const flaggedWorkers = workers.filter((w) => state.flaggedPay.includes(w.id));

  // repeated hazards: categories with >1 complaint in this industry
  const repeatedHazards = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of complaints) counts[c.category] = (counts[c.category] ?? 0) + 1;
    return Object.entries(counts)
      .filter(([, n]) => n > 1)
      .map(([cat, n]) => ({ cat, n }));
  }, [complaints]);

  return (
    <div className="space-y-6">
      {/* Industry banner */}
      <div
        className={`rounded-2xl border p-5 ${meta.softBg} ${meta.borderTone}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm ${meta.headerBg}`}
            >
              {industry === 'construction'
                ? <Users className="h-5 w-5" />
                : <Activity className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {industry === 'construction' ? 'Site command centre' : 'Hospital operations centre'}
              </h3>
              <p className="text-sm text-slate-600">
                {industry === 'construction'
                  ? 'Attendance, overtime, PPE and hazard oversight across all sites.'
                  : 'Day / night shift coverage, fatigue alerts and ward safety oversight.'}
              </p>
            </div>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Add worker
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total workers" value={stats.total} hint={`${stats.present} checked in today`} icon={Users} tone="blue" />
        <StatCard label="Completed shifts today" value={stats.completedToday} hint={`${stats.total - stats.completedToday} still on shift or absent`} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Overtime hours (week)" value={`${stats.totalOTHours}h`} hint="Across all workers" icon={Timer} tone="amber" />
        <StatCard label="Weekly payroll" value={formatMoney(stats.weekPay)} hint="Net take-home, all workers" icon={TrendingUp} tone="emerald" />
      </div>

      {/* Alerts row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Excessive-hours alerts" value={stats.overworkAlerts} hint="Shifts over 10h this week" icon={AlertTriangle} tone="red" />
        <StatCard label="High fatigue-risk staff" value={stats.fatigueHigh.length} hint={stats.fatigueHigh[0] ? stats.fatigueHigh.join(', ') : 'None detected'} icon={Hourglass} tone="amber" />
        <StatCard label="Open safety complaints" value={openComplaints} hint="Need attention" icon={ShieldAlert} tone="red" />
        <StatCard label="Pay discrepancies flagged" value={flaggedWorkers.length} hint={flaggedWorkers[0]?.name ?? 'None flagged'} icon={Flag} tone="amber" />
      </div>

      {/* Insight panel */}
      <Card className={industry === 'construction' ? 'border-amber-200 bg-amber-50/40' : 'border-blue-200 bg-blue-50/40'}>
        <CardHeader
          title="Employer insight panel"
          subtitle="Patterns and overdue items — anonymous reporter identities are never shown here"
          icon={<Lightbulb className={`h-5 w-5 ${industry === 'construction' ? 'text-amber-600' : 'text-blue-600'}`} />}
        />
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <InsightBlock
            title="Repeated hazards"
            empty="No repeated hazard categories yet."
            items={repeatedHazards.map((h) => `${h.cat} — ${h.n} reports`)}
          />
          <InsightBlock
            title="Overdue complaints"
            empty="No overdue complaints. Good response time."
            items={overdueComplaints.map((c) => `${c.id} — ${c.category} (${formatDate(c.createdAt)})`)}
          />
          <InsightBlock
            title="Pay flags to review"
            empty="No pay discrepancies flagged by workers."
            items={flaggedWorkers.map((w) => `${w.name} — ${w.id}`)}
          />
        </div>
      </Card>

      {/* Overwork alert detail */}
      {stats.overworkWorkers.length > 0 && (
        <Card className="border-red-200 bg-red-50/40">
          <CardHeader
            title="Excessive working-hours alert"
            subtitle="These workers exceeded 10 hours in a single shift this week"
            icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          />
          <div className="flex flex-wrap gap-2 p-5">
            {stats.overworkWorkers.map((w, i) => (
              <Badge key={i} tone="red">{w.name} — {w.hours}h</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Pay flag actions */}
      {flaggedWorkers.length > 0 && (
        <Card>
          <CardHeader
            title="Pay discrepancy flags"
            subtitle="Review and clear flags once resolved with the worker"
            icon={<Flag className="h-5 w-5 text-amber-600" />}
          />
          <div className="space-y-3 p-5">
            {flaggedWorkers.map((w) => (
              <div key={w.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                <div>
                  <p className="font-medium text-slate-900">{w.name}</p>
                  <p className="text-xs text-slate-500">{w.profession} · {w.id}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => clearPayFlag(w.id)}>
                  Mark resolved
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Attendance table */}
      <Card>
        <CardHeader
          title="Workforce attendance"
          subtitle="Recent check-in / check-out records"
          icon={<Activity className="h-5 w-5" />}
        />
        <Table
          columns={[
            {
              key: 'worker',
              header: 'Worker',
              render: (r) => {
                const w = workers.find((x) => x.id === r.workerId);
                return (
                  <div className="flex items-center gap-2">
                    {w && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: w.avatarColor }}>
                        {w.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                    )}
                    <span className="font-medium text-slate-900">{w?.name ?? r.workerId}</span>
                  </div>
                );
              },
            },
            { key: 'role', header: 'Profession', render: (r) => workers.find((x) => x.id === r.workerId)?.profession ?? '—' },
            {
              key: 'shift',
              header: 'Shift',
              render: (r) => {
                const w = workers.find((x) => x.id === r.workerId);
                if (!w) return '—';
                return (
                  <span className="inline-flex items-center gap-1 text-xs">
                    <ShiftIcon industry={w.industry} start={w.shiftStart} />
                    {shiftType(w)}
                  </span>
                );
              },
            },
            { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
            { key: 'in', header: 'In', render: (r) => formatTime(r.checkIn) },
            { key: 'out', header: 'Out', render: (r) => formatTime(r.checkOut) },
            {
              key: 'hours',
              header: 'Hours',
              render: (r) => {
                if (!r.checkOut) return <Badge tone="blue">On shift</Badge>;
                const w = workers.find((x) => x.id === r.workerId);
                if (!w) return '—';
                const s = calcShift(r, w);
                return (
                  <span>
                    {s.hoursWorked}h {s.overtimeHours > 0 && <Badge tone="amber" className="ml-1">+{s.overtimeHours}h OT</Badge>}
                  </span>
                );
              },
            },
            {
              key: 'pay',
              header: 'Pay',
              render: (r) => {
                if (!r.checkOut) return '—';
                const w = workers.find((x) => x.id === r.workerId);
                if (!w) return '—';
                return <span className="font-medium">{formatMoney(calcShift(r, w).totalPay)}</span>;
              },
            },
          ]}
          rows={[...attendance].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 20)}
          empty="No attendance records for this industry."
        />
      </Card>

      {/* Complaint summary (no anonymous names) */}
      <Card>
        <CardHeader
          title="Safety complaints"
          subtitle="Anonymous reporter identities are hidden. Manage full cases in the Complaints Centre."
          icon={<ShieldAlert className="h-5 w-5" />}
          action={
            <Button size="sm" variant="outline" onClick={onManageComplaints}>
              Open complaints centre
            </Button>
          }
        />
        {complaints.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">No complaints submitted for this industry yet.</div>
        ) : (
          <Table
            columns={[
              { key: 'id', header: 'ID', render: (c) => <span className="font-mono font-medium">{c.id}</span> },
              {
                key: 'worker',
                header: 'Reporter',
                render: (c) =>
                  c.workerName ? (
                    c.workerName
                  ) : (
                    <Badge tone="slate">Anonymous</Badge>
                  ),
              },
              { key: 'workplace', header: 'Workplace', render: (c) => <span className="text-xs">{c.workplace}</span> },
              { key: 'category', header: 'Category', render: (c) => c.category },
              { key: 'urgency', header: 'Urgency', render: (c) => <Badge tone={urgencyTone(c.urgency)}>{c.urgency}</Badge> },
              { key: 'date', header: 'Filed', render: (c) => formatDateTime(c.createdAt) },
              {
                key: 'status',
                header: 'Status',
                render: (c) => (
                  <span className="flex items-center gap-2">
                    <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                    {isOverdue(c) && <Badge tone="red">Overdue</Badge>}
                  </span>
                ),
              },
            ]}
            rows={complaints}
          />
        )}
      </Card>

      <AddWorkerModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        industry={industry}
        onAdd={addWorker}
      />
    </div>
  );
}

function InsightBlock({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-slate-500">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
          {items.map((it, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddWorkerModal({
  open,
  onClose,
  industry,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  industry: Industry;
  onAdd: (d: {
    name: string;
    profession: string;
    industry: Industry;
    workplace: string;
    hourlyRate: number;
    shiftStart: string;
    shiftEnd: string;
  }) => { ok: boolean; error?: string; worker?: { id: string; name: string }; username?: string; password?: string };
}) {
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [shiftStart, setShiftStart] = useState('08:00');
  const [shiftEnd, setShiftEnd] = useState('17:00');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<{ id: string; name: string; username: string; password: string } | null>(null);

  const reset = () => {
    setName(''); setProfession(''); setWorkplace(''); setHourlyRate('');
    setShiftStart('08:00'); setShiftEnd('17:00'); setErrors([] as any); setErrors({});
    setCreated(null);
  };
  const close = () => { reset(); onClose(); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = 'Enter a full name (min 2 characters).';
    if (profession.trim().length < 2) errs.profession = 'Enter a profession.';
    if (workplace.trim().length < 3) errs.workplace = 'Enter a workplace.';
    const rate = Number(hourlyRate);
    if (!hourlyRate || isNaN(rate) || rate <= 0) errs.hourlyRate = 'Enter a valid positive hourly rate.';
    if (shiftStart === shiftEnd) errs.shift = 'Shift start and end cannot be the same.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const res = onAdd({ name, profession, industry, workplace, hourlyRate: rate, shiftStart, shiftEnd });
    if (res.ok && res.worker) setCreated({ id: res.worker.id, name: res.worker.name, username: res.username ?? res.worker.name.toLowerCase(), password: res.password ?? 'demo123' });
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={created ? 'Worker added' : 'Add a new worker'}
      subtitle={created ? undefined : 'A unique ID and demo login will be generated automatically.'}
    >
      {created ? (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <UserPlus className="h-7 w-7" />
          </div>
          <p className="text-sm text-slate-600">{created.name} has been added to the roster.</p>
          <div className="mt-3 rounded-lg bg-slate-50 p-3 text-left text-sm">
            <p><span className="text-slate-500">Worker ID:</span> <span className="font-mono font-medium">{created.id}</span></p>
            <p><span className="text-slate-500">Demo username:</span> <span className="font-mono">{created.username}</span></p>
            <p><span className="text-slate-500">Demo password:</span> <span className="font-mono">{created.password}</span></p>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Share these credentials with the worker so they can log in to their own dashboard.
          </p>
          <Button className="mt-5 w-full" onClick={close}>Done</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Full name" error={errors.name}>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="e.g. Karthik R." />
          </Field>
          <Field label="Profession" error={errors.profession}>
            <input value={profession} onChange={(e) => setProfession(e.target.value)} className={inputCls} placeholder={industry === 'construction' ? 'e.g. Welder' : 'e.g. Lab Technician'} />
          </Field>
          <Field label="Workplace" error={errors.workplace}>
            <input value={workplace} onChange={(e) => setWorkplace(e.target.value)} className={inputCls} placeholder="Site / ward name" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Hourly rate (₹)" error={errors.hourlyRate}>
              <input value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className={inputCls} placeholder="e.g. 80" inputMode="decimal" />
            </Field>
            <Field label="Shift start" error={errors.shift}>
              <input type="time" value={shiftStart} onChange={(e) => setShiftStart(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Shift end" error={errors.shift}>
              <input type="time" value={shiftEnd} onChange={(e) => setShiftEnd(e.target.value)} className={inputCls} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
            <Button type="submit"><UserPlus className="h-4 w-4" />Add worker</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
