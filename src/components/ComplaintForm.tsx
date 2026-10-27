import { useState } from 'react';
import { AlertTriangle, Send } from 'lucide-react';
import type { ComplaintCategory, Industry } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { sampleWorkers } from '../data/sampleData';

interface Props {
  open: boolean;
  onClose: () => void;
  industry: Industry;
  workerId: string;
  workplaces?: string[]; // optional override (worker scope)
  onSubmit: (data: {
    workerId: string | null;
    workerName: string | null;
    industry: Industry;
    workplace: string;
    category: ComplaintCategory;
    description: string;
    urgency: 'Low' | 'Medium' | 'High';
  }) => string;
}

const categories: ComplaintCategory[] = [
  'Unsafe Equipment',
  'Hazardous Material',
  'Structural Risk',
  'PPE Missing',
  'Sanitation Issue',
  'Electrical Hazard',
  'Long Working Hours',
  'Staffing Shortage',
  'Other',
];

const defaultWorkplacesFor = (industry: Industry) =>
  Array.from(
    new Set(sampleWorkers.filter((w) => w.industry === industry).map((w) => w.workplace))
  );

export default function ComplaintForm({ open, onClose, industry, workerId, workplaces, onSubmit }: Props) {
  const worker = sampleWorkers.find((w) => w.id === workerId);
  const placeOptions = workplaces ?? defaultWorkplacesFor(industry);
  const [anonymous, setAnonymous] = useState(false);
  const [workplace, setWorkplace] = useState(worker?.workplace ?? placeOptions[0] ?? '');
  const [category, setCategory] = useState<ComplaintCategory>('Unsafe Equipment');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const reset = () => {
    setAnonymous(false);
    setCategory('Unsafe Equipment');
    setDescription('');
    setUrgency('Medium');
    setErrors({});
    setSubmittedId(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!workplace) errs.workplace = 'Please select a workplace.';
    if (description.trim().length < 10)
      errs.description = 'Description must be at least 10 characters.';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const id = onSubmit({
      workerId,
      workerName: anonymous ? null : worker?.name ?? null,
      industry,
      workplace,
      category,
      description: description.trim(),
      urgency,
    });
    setSubmittedId(id);
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={submittedId ? 'Complaint submitted' : 'Report a safety hazard'}
      subtitle={
        submittedId
          ? undefined
          : 'Your report helps make the workplace safer for everyone.'
      }
    >
      {submittedId ? (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Send className="h-7 w-7" />
          </div>
          <p className="text-sm text-slate-600">
            Your complaint has been recorded. Save this reference number to track its status:
          </p>
          <p className="mt-3 text-xl font-bold tracking-wide text-slate-900">{submittedId}</p>
          <Button className="mt-6 w-full" onClick={close}>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">
              <span className="font-medium text-slate-800">Submit anonymously</span>
              <span className="block text-xs text-slate-500">
                Your name will not be shown on the complaint.
              </span>
            </span>
          </label>

          <Field label="Workplace" error={errors.workplace}>
            <select
              value={workplace}
              onChange={(e) => setWorkplace(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {placeOptions.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Urgency">
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as 'Low' | 'Medium' | 'High')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </Field>
          </div>

          <Field label="Description" error={errors.description}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the hazard, location, and what happened..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </Field>

          <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            False reports can endanger co-workers. Please report only genuine hazards.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" variant="danger">
              <Send className="h-4 w-4" />
              Submit complaint
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
