import { type ReactNode } from 'react';

type Tone = 'blue' | 'amber' | 'red' | 'emerald' | 'slate' | 'violet';

const tones: Record<Tone, string> = {
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  slate: 'bg-slate-100 text-slate-700 ring-slate-600/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20',
};

export default function Badge({
  children,
  tone = 'slate',
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export const statusTone = (status: string): Tone => {
  if (status === 'Closed') return 'emerald';
  if (status === 'Action Taken') return 'blue';
  if (status === 'Under Review') return 'amber';
  if (status === 'Resolved') return 'emerald';
  return 'red'; // Submitted / Reported
};

export const urgencyTone = (urgency: string): Tone => {
  if (urgency === 'High') return 'red';
  if (urgency === 'Medium') return 'amber';
  return 'slate';
};
