import { useMemo, useState } from 'react';
import {
  ShieldAlert,
  Search,
  Gavel,
  UserCircle2,
  Send,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { AppStore } from '../store/useAppStore';
import { isOverdue } from '../store/useAppStore';
import { formatDateTime } from '../utils/format';
import type { Complaint, ComplaintStatus, Role, Session } from '../types';
import Card, { CardHeader } from './ui/Card';
import Table from './ui/Table';
import Badge, { statusTone, urgencyTone } from './ui/Badge';
import Button from './ui/Button';
import Modal from './ui/Modal';
import StatCard from './ui/StatCard';

interface Props {
  store: AppStore;
  session: Session;
}

const STATUSES: ComplaintStatus[] = ['Submitted', 'Under Review', 'Action Taken', 'Closed'];

const canSeeReporter = (c: Complaint, session: Session): boolean => {
  // Anonymous complaints hide reporter from everyone except the reviewer and the worker who filed it.
  if (!c.workerName)
    return session.role === 'reviewer' || (session.role === 'worker' && c.workerId === session.workerId);
  // Named complaint: reviewer sees it; the worker who filed it sees it; employer does NOT see reporter name.
  if (session.role === 'reviewer') return true;
  if (session.role === 'worker') return c.workerId === session.workerId;
  return false; // employer
};

export default function ComplaintsCentre({ store, session }: Props) {
  const { state, setComplaintStatus, assignComplaint, addCaseNote } = store;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | ComplaintStatus>('All');
  const [noteText, setNoteText] = useState('');

  // Scope complaints by role
  const scoped = useMemo(() => {
    let list = state.complaints;
    if (session.role === 'worker') list = list.filter((c) => c.workerId === session.workerId);
    else if (session.role === 'employer') list = list.filter((c) => c.industry === session.industry);
    // reviewer sees all
    return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [state.complaints, session]);

  const filtered = statusFilter === 'All' ? scoped : scoped.filter((c) => c.status === statusFilter);
  const selected = filtered.find((c) => c.id === selectedId) ?? scoped.find((c) => c.id === selectedId) ?? null;

  const counts = {
    submitted: scoped.filter((c) => c.status === 'Submitted').length,
    review: scoped.filter((c) => c.status === 'Under Review').length,
    action: scoped.filter((c) => c.status === 'Action Taken').length,
    closed: scoped.filter((c) => c.status === 'Closed').length,
  };

  const reviewerName = session.role === 'reviewer' ? session.displayName : 'Reviewer';

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Submitted" value={counts.submitted} icon={Send} tone="red" />
        <StatCard label="Under Review" value={counts.review} icon={Clock} tone="amber" />
        <StatCard label="Action Taken" value={counts.action} icon={AlertTriangle} tone="blue" />
        <StatCard label="Closed" value={counts.closed} icon={CheckCircle2} tone="emerald" />
      </div>

      {/* List */}
      <Card>
        <CardHeader
          title={
            session.role === 'reviewer'
              ? 'Complaint review centre'
              : session.role === 'worker'
              ? 'My complaints'
              : 'Workplace complaints'
          }
          subtitle={
            session.role === 'employer'
              ? 'Reporter identities on anonymous complaints are hidden from employers.'
              : session.role === 'reviewer'
              ? 'Triage, assign, and resolve every case with a full audit trail.'
              : 'Track the status of hazards you reported.'
          }
          icon={<ShieldAlert className="h-5 w-5" />}
          action={
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'All' | ComplaintStatus)}
              aria-label="Filter by status"
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          }
        />
        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            {session.role === 'worker'
              ? 'You have not filed any complaints yet. Use "Report a hazard" on your dashboard.'
              : 'No complaints to show for this filter.'}
          </div>
        ) : (
          <Table
            columns={[
              { key: 'id', header: 'Case ID', render: (c) => <span className="font-mono font-medium">{c.id}</span> },
              {
                key: 'reporter',
                header: 'Reporter',
                render: (c) =>
                  canSeeReporter(c, session) ? (
                    c.workerName ?? <Badge tone="slate">Anonymous</Badge>
                  ) : (
                    <Badge tone="slate">Hidden</Badge>
                  ),
              },
              { key: 'category', header: 'Category', render: (c) => c.category },
              { key: 'workplace', header: 'Workplace', render: (c) => <span className="text-xs">{c.workplace}</span> },
              { key: 'urgency', header: 'Urgency', render: (c) => <Badge tone={urgencyTone(c.urgency)}>{c.urgency}</Badge> },
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
              { key: 'assigned', header: 'Assigned', render: (c) => c.assignedTo ?? <span className="text-slate-400">Unassigned</span> },
              {
                key: 'action',
                header: '',
                render: (c) => (
                  <Button size="sm" variant="outline" onClick={() => setSelectedId(c.id)}>
                    Open case
                  </Button>
                ),
              },
            ]}
            rows={filtered}
          />
        )}
      </Card>

      <CaseDetailModal
        complaint={selected}
        session={session}
        onClose={() => setSelectedId(null)}
        onStatus={(s) => selected && setComplaintStatus(selected.id, s, reviewerName)}
        onAssign={(name) => selected && assignComplaint(selected.id, name, reviewerName)}
        onNote={(text) => {
          if (selected && text.trim()) {
            addCaseNote(selected.id, { author: reviewerName, text: text.trim() });
            setNoteText('');
          }
        }}
        noteText={noteText}
        setNoteText={setNoteText}
        canSeeReporter={canSeeReporter}
      />
    </div>
  );
}

function CaseDetailModal({
  complaint,
  session,
  onClose,
  onStatus,
  onAssign,
  onNote,
  noteText,
  setNoteText,
  canSeeReporter,
}: {
  complaint: Complaint | null;
  session: Session;
  onClose: () => void;
  onStatus: (s: ComplaintStatus) => void;
  onAssign: (name: string) => void;
  onNote: (text: string) => void;
  noteText: string;
  setNoteText: (s: string) => void;
  canSeeReporter: (c: Complaint, s: Session) => boolean;
}) {
  const isReviewer = session.role === 'reviewer';
  const isWorkerOwner = complaint && session.role === 'worker' && complaint.workerId === session.workerId;
  const canUpdate = isReviewer; // only reviewer changes status/assign/notes in the centre

  if (!complaint) return null;

  return (
    <Modal
      open={!!complaint}
      onClose={onClose}
      title={`Case ${complaint.id}`}
      subtitle={`${complaint.category} · ${complaint.workplace}`}
      footer={
        <Button variant="ghost" onClick={onClose}>Close</Button>
      }
    >
      <div className="space-y-5">
        {/* meta */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Meta label="Urgency" value={<Badge tone={urgencyTone(complaint.urgency)}>{complaint.urgency}</Badge>} />
          <Meta label="Status" value={<Badge tone={statusTone(complaint.status)}>{complaint.status}</Badge>} />
          <Meta label="Filed" value={formatDateTime(complaint.createdAt)} />
          <Meta label="Last updated" value={formatDateTime(complaint.updatedAt)} />
          <Meta
            label="Reporter"
            value={
              canSeeReporter(complaint, session)
                ? complaint.workerName ?? 'Anonymous'
                : 'Hidden from your role'
            }
          />
          <Meta label="Assigned to" value={complaint.assignedTo ?? 'Unassigned'} />
        </div>

        {/* description */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Description</p>
          <p>{complaint.description}</p>
        </div>

        {/* reviewer controls */}
        {canUpdate && (
          <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-800">Reviewer actions</p>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={complaint.status === s ? 'secondary' : 'outline'}
                  onClick={() => onStatus(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-600">Assign to:</span>
              <Button size="sm" variant="outline" onClick={() => onAssign('Priya Menon')}>
                Priya Menon
              </Button>
              {complaint.assignedTo && (
                <Button size="sm" variant="ghost" onClick={() => onAssign('')}>
                  Unassign
                </Button>
              )}
            </div>
          </div>
        )}

        {/* notes */}
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <ClipboardList className="h-4 w-4" /> Case notes
          </p>
          {complaint.notes.length === 0 ? (
            <p className="text-xs text-slate-500">No notes added yet.</p>
          ) : (
            <ul className="space-y-2">
              {complaint.notes.map((n, i) => (
                <li key={i} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                  <p className="text-slate-700">{n.text}</p>
                  <p className="mt-1 text-xs text-slate-400">{n.author} · {formatDateTime(n.at)}</p>
                </li>
              ))}
            </ul>
          )}
          {canUpdate && (
            <div className="mt-3 flex gap-2">
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a case note…"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Button size="sm" onClick={() => onNote(noteText)} disabled={!noteText.trim()}>
                <Send className="h-4 w-4" /> Add
              </Button>
            </div>
          )}
        </div>

        {/* timeline */}
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Clock className="h-4 w-4" /> Case timeline
          </p>
          <ol className="relative space-y-3 border-l border-slate-200 pl-4">
            {complaint.timeline.map((t, i) => (
              <li key={i} className="text-sm">
                <span className="absolute -left-[5px] mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                <p className="text-slate-700">{t.action}</p>
                <p className="text-xs text-slate-400">{t.actor} · {formatDateTime(t.at)}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* disclaimer */}
        {!canSeeReporter(complaint, session) && (
          <p className="rounded-lg bg-slate-100 p-3 text-xs text-slate-500">
            Reporter identity is hidden for your role to protect workers from retaliation.
            Frontend-only anonymity is a demo safeguard and is not production-secure.
          </p>
        )}
      </div>
    </Modal>
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 font-medium text-slate-900">{value}</p>
    </div>
  );
}
