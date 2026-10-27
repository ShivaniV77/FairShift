import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  Gavel,
  Lightbulb,
  RefreshCw,
  AlertTriangle,
  Clock,
  Flag,
  ShieldAlert as ShieldAlertIcon,
} from 'lucide-react';
import { useAppStore } from './store/useAppStore';
import AppShell, { type NavKey } from './components/ui/AppShell';
import ReviewerShell from './components/ui/ReviewerShell';
import LoginPage from './components/LoginPage';
import WorkerDashboard from './components/WorkerDashboard';
import EmployerDashboard from './components/EmployerDashboard';
import ComplaintsCentre from './components/ComplaintsCentre';
import Modal from './components/ui/Modal';
import Button from './components/ui/Button';

export default function App() {
  const store = useAppStore();
  const { state, setIndustry, logout, resetDemoData } = store;
  const [nav, setNav] = useState<NavKey>('dashboard');
  const [confirmReset, setConfirmReset] = useState(false);

  const session = state.session;

  // reset to dashboard whenever role changes (login/logout)
  useEffect(() => {
    setNav('dashboard');
  }, [session?.username, session?.role]);

  // not logged in → portal selection + login
  if (!session) {
    return <LoginPage store={store} />;
  }

  // Worker
  if (session.role === 'worker') {
    const worker = state.workers.find((w) => w.id === session.workerId);
    if (!worker) {
      return (
        <AppShell
          session={session}
          industry={session.industry ?? 'construction'}
          nav={nav}
          onNav={setNav}
          navItems={[
            { key: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
            { key: 'complaints', label: 'My Complaints', icon: ShieldAlert },
          ]}
          onIndustry={setIndustry}
          onReset={() => setConfirmReset(true)}
          onLogout={logout}
        >
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
            Your worker profile could not be found. Please reset demo data and log in again.
          </div>
          <ResetModal open={confirmReset} onClose={() => setConfirmReset(false)} onConfirm={resetDemoData} />
        </AppShell>
      );
    }
    return (
      <AppShell
        session={session}
        industry={worker.industry}
        nav={nav}
        onNav={setNav}
        navItems={[
          { key: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
          { key: 'complaints', label: 'My Complaints', icon: ShieldAlert },
        ]}
        onIndustry={setIndustry}
        onReset={() => setConfirmReset(true)}
        onLogout={logout}
      >
        {nav === 'dashboard' ? (
          <WorkerDashboard store={store} worker={worker} username={session.username} />
        ) : (
          <ComplaintsCentre store={store} session={session} />
        )}
        <ResetModal open={confirmReset} onClose={() => setConfirmReset(false)} onConfirm={resetDemoData} />
      </AppShell>
    );
  }

  // Employer
  if (session.role === 'employer') {
    const industry = session.industry ?? state.industry;
    return (
      <AppShell
        session={session}
        industry={industry}
        nav={nav}
        onNav={setNav}
        navItems={[
          { key: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { key: 'complaints', label: 'Complaints', icon: ShieldAlert },
        ]}
        onIndustry={setIndustry}
        onReset={() => setConfirmReset(true)}
        onLogout={logout}
      >
        {nav === 'dashboard' ? (
          <EmployerDashboard store={store} industry={industry} onManageComplaints={() => setNav('complaints')} />
        ) : (
          <ComplaintsCentre store={store} session={session} />
        )}
        <ResetModal open={confirmReset} onClose={() => setConfirmReset(false)} onConfirm={resetDemoData} />
      </AppShell>
    );
  }

  // Reviewer
  return (
    <ReviewerShell
      session={session}
      nav={nav}
      onNav={setNav}
      navItems={[
        { key: 'review', label: 'Review Centre', icon: Gavel },
        { key: 'insights', label: 'Insights', icon: Lightbulb },
      ]}
      onReset={() => setConfirmReset(true)}
      onLogout={logout}
    >
      {nav === 'review' ? (
        <ComplaintsCentre store={store} session={session} />
      ) : (
        <ReviewerInsights store={store} />
      )}
      <ResetModal open={confirmReset} onClose={() => setConfirmReset(false)} onConfirm={resetDemoData} />
    </ReviewerShell>
  );
}

function ResetModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reset demo data?"
      subtitle="This restores all sample workers, attendance, complaints and accounts. Your live changes will be cleared and you'll be kept logged out."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            <RefreshCw className="h-4 w-4" /> Reset everything
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">
        This action cannot be undone. The demo will return to its original sample state.
      </p>
    </Modal>
  );
}

// ---- Reviewer insights panel ----
import { isOverdue } from './store/useAppStore';
import { formatDate } from './utils/format';
import StatCard from './components/ui/StatCard';
import Card, { CardHeader } from './components/ui/Card';
import Badge, { statusTone, urgencyTone } from './components/ui/Badge';
import Table from './components/ui/Table';

function ReviewerInsights({ store }: { store: ReturnType<typeof useAppStore> }) {
  const { state } = store;
  const all = state.complaints;

  const insights = useMemo(() => {
    const overdue = all.filter(isOverdue);
    const byCategory: Record<string, number> = {};
    for (const c of all) byCategory[c.category] = (byCategory[c.category] ?? 0) + 1;
    const repeated = Object.entries(byCategory).filter(([, n]) => n > 1).map(([cat, n]) => ({ cat, n }));
    const flaggedPay = state.flaggedPay.length;
    return {
      total: all.length,
      open: all.filter((c) => c.status !== 'Closed').length,
      overdue,
      repeated,
      flaggedPay,
    };
  }, [all, state.flaggedPay]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total cases" value={insights.total} icon={ShieldAlert} tone="blue" />
        <StatCard label="Open cases" value={insights.open} icon={Clock} tone="amber" />
        <StatCard label="Overdue cases" value={insights.overdue.length} icon={AlertTriangle} tone="red" />
        <StatCard label="Pay discrepancies flagged" value={insights.flaggedPay} icon={Flag} tone="amber" />
      </div>

      <Card className="border-violet-200 bg-violet-50/40">
        <CardHeader
          title="Repeated hazard categories"
          subtitle="Categories reported more than once across all industries"
          icon={<Lightbulb className="h-5 w-5 text-violet-600" />}
        />
        {insights.repeated.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-500">No repeated hazard categories yet.</div>
        ) : (
          <div className="flex flex-wrap gap-2 p-5">
            {insights.repeated.map((r) => (
              <Badge key={r.cat} tone="violet">{r.cat} — {r.n} reports</Badge>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Overdue cases"
          subtitle="Open for more than 2 days without action"
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
        />
        {insights.overdue.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-500">No overdue cases. Great response time.</div>
        ) : (
          <Table
            columns={[
              { key: 'id', header: 'ID', render: (c) => <span className="font-mono font-medium">{c.id}</span> },
              { key: 'category', header: 'Category', render: (c) => c.category },
              { key: 'industry', header: 'Industry', render: (c) => <span className="capitalize">{c.industry}</span> },
              { key: 'workplace', header: 'Workplace', render: (c) => <span className="text-xs">{c.workplace}</span> },
              { key: 'urgency', header: 'Urgency', render: (c) => <Badge tone={urgencyTone(c.urgency)}>{c.urgency}</Badge> },
              { key: 'filed', header: 'Filed', render: (c) => formatDate(c.createdAt) },
              { key: 'status', header: 'Status', render: (c) => <Badge tone={statusTone(c.status)}>{c.status}</Badge> },
            ]}
            rows={insights.overdue}
          />
        )}
      </Card>
    </div>
  );
}
