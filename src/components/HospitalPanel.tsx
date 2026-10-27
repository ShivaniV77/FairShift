import {
  Stethoscope,
  HeartPulse,
  Moon,
  Sunrise,
  Bed,
  Activity,
  Droplet,
  ShieldPlus,
  Users,
} from 'lucide-react';
import type { Worker } from '../types';
import Card, { CardHeader } from './ui/Card';
import Badge from './ui/Badge';

interface Props {
  worker: Worker;
}

const shiftType = (w: Worker): 'Day' | 'Night' | 'Evening' => {
  const s = parseInt(w.shiftStart.slice(0, 2), 10);
  if (s >= 20 || s < 6) return 'Night';
  if (s >= 14) return 'Evening';
  return 'Day';
};

const roleDuties: Record<string, string[]> = {
  'Nursing Assistant': ['Take vitals on schedule', 'Assist patient mobility', 'Log handover notes'],
  'Patient Support Attendant': ['Reposition immobile patients q2h', 'Respond to call bells', 'Assist with feeds'],
  'Waste Handling Technician': ['Segregate bio-waste by colour', 'Maintain spill kit', 'Log waste manifests'],
  'Laundry Technician': ['Sort infected vs clean linen', 'Run autoclave cycles', 'Restock ward linen'],
};

export default function HospitalPanel({ worker }: Props) {
  const duties = roleDuties[worker.profession] ?? ['Follow ward in-charge instructions'];
  const st = shiftType(worker);

  return (
    <div className="space-y-6">
      {/* Cool gradient hero strip */}
      <div className="overflow-hidden rounded-2xl border border-blue-300 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 p-0.5">
        <div className="rounded-[14px] bg-white/95 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-blue-900">Ward &amp; shift workflow</h3>
              <p className="text-sm text-indigo-800/80">Your role-specific duties and coverage for today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shift & ward coverage */}
      <Card className="border-blue-200">
        <CardHeader
          title="Your shift & ward coverage"
          subtitle="Day / night rotation and ward assignment"
          icon={<Activity className="h-5 w-5 text-blue-600" />}
        />
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-blue-700">
              {st === 'Night' ? <Moon className="h-5 w-5" /> : st === 'Evening' ? <Sunrise className="h-5 w-5" /> : <Sunrise className="h-5 w-5" />}
              <span className="text-sm font-semibold">{st} shift</span>
            </div>
            <p className="text-xs text-slate-500">{worker.shiftStart} – {worker.shiftEnd}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-700">
              <Bed className="h-5 w-5" />
              <span className="text-sm font-semibold">Ward</span>
            </div>
            <p className="text-xs text-slate-500">{worker.workplace}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-700">
              <Users className="h-5 w-5" />
              <span className="text-sm font-semibold">Coverage target</span>
            </div>
            <p className="text-xs text-slate-500">
              {st === 'Night' ? '2 attendants per ward' : '4 attendants per ward'}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Role-specific duties */}
        <Card>
          <CardHeader
            title={`${worker.profession} — shift duties`}
            subtitle="Your role-specific responsibilities"
            icon={<HeartPulse className="h-5 w-5" />}
          />
          <ul className="space-y-2 p-5 text-sm text-slate-700">
            {duties.map((d, i) => (
              <li key={i} className="flex gap-2">
                <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Fatigue & rest alerts + infection control */}
        <div className="space-y-6">
          <Card className="border-violet-200 bg-violet-50/30">
            <CardHeader
              title="Fatigue & rest alerts"
              subtitle="Night-shift and back-to-back rotation"
              icon={<Moon className="h-5 w-5 text-violet-600" />}
            />
            <ul className="space-y-2 p-5 text-sm text-slate-700">
              <li className="flex gap-2"><Moon className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />Minimum 11 hours rest between shifts.</li>
              <li className="flex gap-2"><Droplet className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />Hydrate every 90 minutes on night shift.</li>
              <li className="flex gap-2"><HeartPulse className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />Report palpitations or dizziness to ward in-charge.</li>
            </ul>
          </Card>

          <Card className="border-blue-200">
            <CardHeader
              title="Infection control reminders"
              subtitle="Ward hygiene standards"
              icon={<ShieldPlus className="h-5 w-5 text-blue-600" />}
            />
            <ul className="space-y-2 p-5 text-sm text-slate-700">
              <li className="flex gap-2"><ShieldPlus className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />Colour-code bio-waste bins at source.</li>
              <li className="flex gap-2"><Droplet className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />Sanitise hands between every patient zone.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
