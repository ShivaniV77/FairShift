import {
  HardHat,
  ShieldCheck,
  HardHat as HardHatIcon,
  AlertTriangle,
  Wrench,
  Cable,
  Construction,
  Hammer,
} from 'lucide-react';
import type { Worker } from '../types';
import Card, { CardHeader } from './ui/Card';
import Badge from './ui/Badge';

interface Props {
  worker: Worker;
}

const ppeItems = [
  { name: 'Helmet', required: true },
  { name: 'Safety boots', required: true },
  { name: 'High-vis vest', required: true },
  { name: 'Harness (height work)', required: true },
  { name: 'Gloves', required: false },
  { name: 'Safety goggles', required: false },
];

const tradeTasks: Record<string, string[]> = {
  Mason: ['Lay bricks/blocks to line', 'Mix mortar to spec', 'Check plumb & level'],
  'Site Helper': ['Move materials to work area', 'Keep walkways clear', 'Assist trades'],
  Scaffolder: ['Erect & tag scaffolding', 'Inspect before use', 'Dismantle safely'],
  'Crane Operator': ['Pre-use checks', 'Lift plan sign-off', 'Communicate with rigger'],
};

export default function ConstructionPanel({ worker }: Props) {
  const tasks = tradeTasks[worker.profession] ?? ['Follow site supervisor instructions'];
  return (
    <div className="space-y-6">
      {/* Warm gradient hero strip */}
      <div className="overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 p-0.5">
        <div className="rounded-[14px] bg-white/95 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-sm">
              <HardHat className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-orange-900">Site safety &amp; daily tasks</h3>
              <p className="text-sm text-amber-800/80">Your trade-specific workflow for today</p>
            </div>
          </div>
        </div>
      </div>

      {/* PPE checklist */}
      <Card className="border-amber-300">
        <CardHeader
          title="PPE checklist"
          subtitle="Confirm your gear before stepping on site"
          icon={<HardHat className="h-5 w-5 text-orange-600" />}
        />
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {ppeItems.map((p) => (
            <div
              key={p.name}
              className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/40 px-3 py-2.5 text-sm"
            >
              <span className="flex items-center gap-2 text-slate-700">
                <ShieldCheck className="h-4 w-4 text-orange-600" />
                {p.name}
              </span>
              {p.required ? <Badge tone="amber">Required</Badge> : <Badge tone="slate">Optional</Badge>}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trade-specific tasks */}
        <Card className="border-amber-200">
          <CardHeader
            title={`${worker.profession} — daily tasks`}
            subtitle="Your trade-specific responsibilities"
            icon={<Wrench className="h-5 w-5 text-orange-600" />}
          />
          <ul className="space-y-2 p-5 text-sm text-slate-700">
            {tasks.map((t, i) => (
              <li key={i} className="flex gap-2">
                <Hammer className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Site supervisor + hazard reporting */}
        <Card className="border-red-300 bg-red-50/30">
          <CardHeader
            title="Site safety rules"
            subtitle="Reported by your site supervisor"
            icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          />
          <ul className="space-y-2 p-5 text-sm text-slate-700">
            <li className="flex gap-2"><Construction className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />No work at height without a tagged harness.</li>
            <li className="flex gap-2"><Cable className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />Report exposed wiring to the supervisor immediately.</li>
            <li className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />30-minute break mandatory after 5 continuous hours.</li>
            <li className="flex gap-2"><HardHatIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />Expired PPE is a high-urgency hazard — report it.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
