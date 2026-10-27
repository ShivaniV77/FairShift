import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

interface Props {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: LucideIcon;
  tone?: 'blue' | 'amber' | 'red' | 'emerald' | 'slate';
}

const tones: Record<NonNullable<Props['tone']>, string> = {
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  slate: 'bg-slate-100 text-slate-600',
};

export default function StatCard({ label, value, hint, icon: Icon, tone = 'slate' }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
