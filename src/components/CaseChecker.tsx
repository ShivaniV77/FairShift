import { useState } from 'react';
import { Search, ShieldCheck, AlertCircle } from 'lucide-react';
import type { AppStore } from '../store/useAppStore';
import { formatDateTime } from '../utils/format';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge, { statusTone, urgencyTone } from './ui/Badge';
import type { Complaint } from '../types';

interface Props {
  store: AppStore;
}

export default function CaseChecker({ store }: Props) {
  const { state } = store;
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Complaint | null | 'notfound'>(null);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toUpperCase();
    if (!q) return;
    const found = state.complaints.find((c) => c.id.toUpperCase() === q);
    setResult(found ?? 'notfound');
  };

  return (
    <Card className="mx-auto max-w-lg p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
          <Search className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Check a complaint status</h3>
          <p className="text-xs text-slate-500">Enter your case reference ID (e.g. CMP-001).</p>
        </div>
      </div>
      <form onSubmit={search} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="CMP-001"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <Button type="submit"><Search className="h-4 w-4" />Check</Button>
      </form>

      {result === 'notfound' && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> No case found with that ID.
        </div>
      )}
      {result && result !== 'notfound' && (
        <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono font-semibold text-slate-900">{result.id}</span>
            <Badge tone={statusTone(result.status)}>{result.status}</Badge>
          </div>
          <div>
            <p className="text-xs text-slate-500">Category</p>
            <p className="font-medium text-slate-800">{result.category}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Urgency</p>
            <p><Badge tone={urgencyTone(result.urgency)}>{result.urgency}</Badge></p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Filed</p>
            <p className="font-medium text-slate-800">{formatDateTime(result.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Last update</p>
            <p className="font-medium text-slate-800">{formatDateTime(result.updatedAt)}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-500">Timeline</p>
            <ol className="space-y-1 text-xs text-slate-600">
              {result.timeline.map((t, i) => (
                <li key={i}>• {t.action} — {formatDateTime(t.at)}</li>
              ))}
            </ol>
          </div>
          <p className="flex items-center gap-1.5 pt-2 text-xs text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Reporter identity is not shown on this public check.
          </p>
        </div>
      )}
    </Card>
  );
}
