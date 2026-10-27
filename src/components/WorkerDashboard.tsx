import { useState } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  Wallet,
  History,
  AlertTriangle,
  UserCircle2,
  Building2,
  Banknote,
  TrendingUp,
  ShieldAlert,
  Flag,
  BadgeCheck,
  Hourglass,
  Moon,
  Sun,
  Sunset,
  ShieldX,
  KeyRound,
  Check,
  AlertCircle,
} from 'lucide-react';
import type { AppStore } from '../store/useAppStore';
import {
  calcShift,
  workerAttendanceToday,
  workerHistory,
  workerComplaints,
  weeklyEarnings,
  fatigueRiskFor,
} from '../store/useAppStore';
import { formatTime, formatDate, formatMoney, todayLabel, formatDateTime } from '../utils/format';
import { shiftType } from '../data/sampleData';
import type { Worker } from '../types';
import Card, { CardHeader } from './ui/Card';
import Button from './ui/Button';
import StatCard from './ui/StatCard';
import Table from './ui/Table';
import Badge, { statusTone, urgencyTone } from './ui/Badge';
import Modal from './ui/Modal';
import ComplaintForm from './ComplaintForm';
import ConstructionPanel from './ConstructionPanel';
import HospitalPanel from './HospitalPanel';

interface Props {
  store: AppStore;
  worker: Worker;
  username: string;
}

const ShiftIcon = (w: Worker) => {
  const t = shiftType(w);
  if (t === 'Night') return Moon;
  if (t === 'Evening') return Sunset;
  return Sun;
};

export default function WorkerDashboard({ store, worker, username }: Props) {
  const { state, checkIn, checkOut, addComplaint, flagPayDiscrepancy, changePassword } = store;
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [pwOpen, setPwOpen] = useState(false);

  const todayRec = workerAttendanceToday(state, worker.id);
  const checkedIn = !!todayRec && !todayRec.checkOut;
  const history = workerHistory(state, worker.id);
  const complaints = workerComplaints(state, worker.id);
  const todayShift = todayRec && todayRec.checkOut ? calcShift(todayRec, worker) : null;
  const week = weeklyEarnings(state, worker);
  const fatigue = fatigueRiskFor(state, worker);
  const ShiftI = ShiftIcon(worker);
  const isFlagged = state.flaggedPay.includes(worker.id);

  const onCheckIn = () => {
    checkIn(worker.id);
    setFlash('Checked in. Have a safe shift.');
    setTimeout(() => setFlash(null), 2500);
  };
  const onCheckOut = () => {
    checkOut(worker.id);
    setFlash('Checked out. Your pay has been calculated.');
    setTimeout(() => setFlash(null), 2500);
  };
  const onFlag = () => {
    flagPayDiscrepancy(worker.id);
    setFlagged(true);
    setFlash('Pay discrepancy flagged. Your employer and reviewer have been notified.');
    setTimeout(() => setFlash(null), 3500);
  };

  const isConstruction = worker.industry === 'construction';

  return (
    <div className="space-y-6">
      {flash && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {flash}
        </div>
      )}

      {/* Profile + check-in */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title={worker.name}
            subtitle={`${worker.profession} · ID ${worker.id}`}
            icon={<UserCircle2 className="h-5 w-5" />}
          />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <InfoRow icon={<Building2 className="h-4 w-4" />} label="Workplace" value={worker.workplace} />
            <InfoRow
              icon={<ShiftI className="h-4 w-4" />}
              label="Shift"
              value={`${worker.shiftStart} – ${worker.shiftEnd} (${shiftType(worker)})`}
            />
            <InfoRow
              icon={<Banknote className="h-4 w-4" />}
              label="Hourly rate"
              value={formatMoney(worker.hourlyRate)}
            />
            <InfoRow icon={<Clock className="h-4 w-4" />} label="Today" value={todayLabel()} />
          </div>
          <div className="border-t border-slate-100 p-5">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-slate-500">Today's status</span>
              <Badge tone={checkedIn ? 'blue' : todayRec ? 'emerald' : 'slate'}>
                {checkedIn ? 'On shift' : todayRec ? 'Completed' : 'Not checked in'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Check-in</p>
                <p className="font-semibold text-slate-900">{formatTime(todayRec?.checkIn ?? null)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Check-out</p>
                <p className="font-semibold text-slate-900">{formatTime(todayRec?.checkOut ?? null)}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="success" onClick={onCheckIn} disabled={checkedIn || !!todayRec?.checkOut}>
                <LogIn className="h-4 w-4" />
                Check in
              </Button>
              <Button variant="danger" onClick={onCheckOut} disabled={!checkedIn}>
                <LogOut className="h-4 w-4" />
                Check out
              </Button>
              <Button variant="outline" onClick={() => setComplaintOpen(true)}>
                <ShieldAlert className="h-4 w-4" />
                Report a hazard
              </Button>
              <Button variant="outline" onClick={() => { setExplainOpen(true); setFlagged(isFlagged); }}>
                <Wallet className="h-4 w-4" />
                Explain my pay
              </Button>
              <Button variant="ghost" onClick={() => setPwOpen(true)}>
                <KeyRound className="h-4 w-4" />
                Change password
              </Button>
            </div>
          </div>
        </Card>

        {/* Today's pay */}
        <Card>
          <CardHeader title="Today's pay" subtitle="Transparent breakdown" icon={<Wallet className="h-5 w-5" />} />
          <div className="p-5">
            {todayShift ? (
              <SalaryBreakdown shift={todayShift} />
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                Check in and check out to see today's pay calculation.
              </p>
            )}
            {isFlagged && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                <Flag className="h-3.5 w-3.5" /> A pay discrepancy is flagged on your account.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Weekly summary + fatigue */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Hours this week"
          value={`${week.hoursWorked}h`}
          hint={`Standard ${week.standardHours}h · OT ${week.overtimeHours}h`}
          icon={Clock}
          tone="blue"
        />
        <StatCard
          label="Basic pay (week)"
          value={formatMoney(week.basicPay)}
          icon={Banknote}
          tone="emerald"
        />
        <StatCard
          label="Overtime pay (week)"
          value={formatMoney(week.overtimePay)}
          icon={TrendingUp}
          tone="amber"
        />
        <StatCard
          label="Net take-home (week)"
          value={formatMoney(week.totalPay)}
          hint={`After ${formatMoney(week.deductions)} welfare deduction`}
          icon={Wallet}
          tone="emerald"
        />
      </div>

      {/* Industry-specific experience */}
      {isConstruction ? <ConstructionPanel worker={worker} /> : <HospitalPanel worker={worker} />}

      {/* Fatigue + skill passport */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Fatigue risk */}
        <Card>
          <CardHeader
            title="Fatigue-risk check"
            subtitle="Based on your recent shifts"
            icon={<Hourglass className="h-5 w-5" />}
          />
          <div className="p-5">
            <Badge
              tone={fatigue.level === 'High' ? 'red' : fatigue.level === 'Moderate' ? 'amber' : 'emerald'}
            >
              {fatigue.level} risk
            </Badge>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
              {fatigue.reasons.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-slate-400">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Skill passport */}
        <Card>
          <CardHeader
            title="Skill passport"
            subtitle="Skills & certification expiry"
            icon={<BadgeCheck className="h-5 w-5" />}
          />
          <div className="p-5">
            {worker.skills.length === 0 ? (
              <p className="text-sm text-slate-500">No skills recorded yet.</p>
            ) : (
              <ul className="space-y-3">
                {worker.skills.map((s) => (
                  <li key={s.name} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <p className="font-medium text-slate-900">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.certification}</p>
                      <p className="text-xs text-slate-400">Expires {formatDate(s.expiresOn)}</p>
                    </div>
                    <Badge tone={s.status === 'Valid' ? 'emerald' : s.status === 'Expiring' ? 'amber' : 'red'}>
                      {s.status === 'Expired' ? <ShieldX className="h-3 w-3" /> : null}
                      {s.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      {/* Attendance history */}
      <Card>
        <CardHeader
          title="Attendance history"
          subtitle="Your recent check-in and check-out records"
          icon={<History className="h-5 w-5" />}
        />
        <Table
          columns={[
            { key: 'date', header: 'Date', render: (r) => <span className="font-medium">{formatDate(r.date)}</span> },
            { key: 'in', header: 'Check-in', render: (r) => formatTime(r.checkIn) },
            { key: 'out', header: 'Check-out', render: (r) => formatTime(r.checkOut) },
            {
              key: 'hours',
              header: 'Hours',
              render: (r) => {
                if (!r.checkOut) return <Badge tone="blue">In progress</Badge>;
                const s = calcShift(r, worker);
                return (
                  <span>
                    {s.hoursWorked}h{' '}
                    {s.overtimeHours > 0 && <Badge tone="amber" className="ml-1">+{s.overtimeHours}h OT</Badge>}
                  </span>
                );
              },
            },
            {
              key: 'pay',
              header: 'Pay',
              render: (r) => {
                if (!r.checkOut) return '—';
                return <span className="font-medium">{formatMoney(calcShift(r, worker).totalPay)}</span>;
              },
            },
          ]}
          rows={history}
          empty="No attendance records yet. Check in to begin."
        />
      </Card>

      {/* My complaints */}
      <Card>
        <CardHeader
          title="My safety complaints"
          subtitle="Track the status of hazards you reported"
          icon={<AlertTriangle className="h-5 w-5" />}
          action={
            <Button size="sm" variant="outline" onClick={() => setComplaintOpen(true)}>
              <ShieldAlert className="h-4 w-4" />
              New report
            </Button>
          }
        />
        {complaints.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            You have not filed any complaints yet. Anonymous reports will not appear here.
          </div>
        ) : (
          <Table
            columns={[
              { key: 'id', header: 'ID', render: (c) => <span className="font-mono font-medium">{c.id}</span> },
              { key: 'cat', header: 'Category', render: (c) => c.category },
              { key: 'urgency', header: 'Urgency', render: (c) => <Badge tone={urgencyTone(c.urgency)}>{c.urgency}</Badge> },
              { key: 'date', header: 'Filed', render: (c) => formatDateTime(c.createdAt) },
              { key: 'status', header: 'Status', render: (c) => <Badge tone={statusTone(c.status)}>{c.status}</Badge> },
            ]}
            rows={complaints}
          />
        )}
      </Card>

      <ComplaintForm
        open={complaintOpen}
        onClose={() => setComplaintOpen(false)}
        industry={worker.industry}
        workerId={worker.id}
        workplaces={[worker.workplace]}
        onSubmit={addComplaint}
      />

      {/* Explain My Pay modal */}
      <Modal
        open={explainOpen}
        onClose={() => setExplainOpen(false)}
        title="Explain my pay"
        subtitle="A plain-language breakdown of how your take-home is calculated"
        footer={
          <>
            {flagged && (
              <span className="mr-auto inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                <BadgeCheck className="h-4 w-4" /> Discrepancy flagged
              </span>
            )}
            <Button variant="ghost" onClick={() => setExplainOpen(false)}>Close</Button>
            <Button variant="danger" onClick={onFlag} disabled={isFlagged || flagged}>
              <Flag className="h-4 w-4" />
              {isFlagged || flagged ? 'Already flagged' : 'Flag a pay discrepancy'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-sm text-slate-700">
          <Row label="Your agreed hourly rate" value={formatMoney(worker.hourlyRate)} />
          <Row label="Standard shift length" value="8 hours paid at base rate" />
          <Row label="Overtime rate" value="1.5× your hourly rate" />
          <Row label="Welfare deduction" value="2% of gross (welfare fund)" />
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="font-medium text-slate-800">This week so far</p>
            <div className="mt-2 space-y-1.5">
              <Row label="Hours worked" value={`${week.hoursWorked}h (OT ${week.overtimeHours}h)`} />
              <Row label="Basic pay" value={formatMoney(week.basicPay)} />
              <Row label="Overtime pay" value={formatMoney(week.overtimePay)} />
              <Row label="Deductions" value={`- ${formatMoney(week.deductions)}`} />
              <div className="flex items-center justify-between border-t border-slate-200 pt-2 font-semibold">
                <span>Net take-home</span>
                <span>{formatMoney(week.totalPay)}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            If your records show different hours or pay than what you actually worked, flag a
            discrepancy. Your employer and the complaints reviewer will be notified.
          </p>
        </div>
      </Modal>

      <ChangePasswordModal
        open={pwOpen}
        onClose={() => setPwOpen(false)}
        username={username}
        onChange={changePassword}
      />
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-slate-400">{icon}</div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function ChangePasswordModal({
  open,
  onClose,
  username,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  username: string;
  onChange: (u: string, cur: string, next: string) => { ok: boolean; error?: string };
}) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const reset = () => {
    setCurrent(''); setNext(''); setConfirm(''); setError(null); setDone(false);
  };
  const close = () => { reset(); onClose(); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!current) return setError('Enter your current password.');
    if (next.length < 4) return setError('New password must be at least 4 characters.');
    if (next !== confirm) return setError('New password and confirmation do not match.');
    const res = onChange(username, current, next);
    if (!res.ok) return setError(res.error ?? 'Could not change password.');
    setDone(true);
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={done ? 'Password changed' : 'Change password'}
      subtitle={done ? undefined : 'Enter your current password, then choose a new one.'}
    >
      {done ? (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check className="h-7 w-7" />
          </div>
          <p className="text-sm text-slate-600">Your password has been updated. Use it next time you log in.</p>
          <Button className="mt-5 w-full" onClick={close}>Done</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Current password</label>
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputCls} autoComplete="off" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New password</label>
            <input type="password" value={next} onChange={(e) => setNext(e.target.value)} className={inputCls} autoComplete="off" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirm new password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} autoComplete="off" />
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
            <Button type="submit"><KeyRound className="h-4 w-4" />Update password</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

function SalaryBreakdown({ shift }: { shift: ReturnType<typeof calcShift> }) {
  const rows: Array<{ label: string; value: string; tone?: 'pos' | 'neg' }> = [
    { label: 'Standard hours', value: `${shift.standardHours}h` },
    { label: 'Basic pay', value: formatMoney(shift.basicPay), tone: 'pos' },
    { label: 'Overtime hours', value: `${shift.overtimeHours}h` },
    { label: 'Overtime pay (1.5×)', value: formatMoney(shift.overtimePay), tone: 'pos' },
    { label: 'Welfare deduction (2%)', value: `- ${formatMoney(shift.deductions)}`, tone: 'neg' },
  ];
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between text-sm">
          <span className="text-slate-600">{r.label}</span>
          <span
            className={`font-medium ${
              r.tone === 'pos' ? 'text-emerald-600' : r.tone === 'neg' ? 'text-red-600' : 'text-slate-900'
            }`}
          >
            {r.value}
          </span>
        </div>
      ))}
      <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
        <span className="text-sm font-semibold text-slate-900">Total take-home</span>
        <span className="text-lg font-bold text-slate-900">{formatMoney(shift.totalPay)}</span>
      </div>
    </div>
  );
}
