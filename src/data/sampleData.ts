import type { Worker, Complaint, AttendanceRecord, Industry, Account, Skill } from '../types';

const today = new Date();
const isoDate = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d;
};
const atTime = (d: Date, h: number, m: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m).toISOString();
const dateAhead = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return isoDate(d);
};

const skill = (
  name: string,
  certification: string,
  expiryOffset: number
): Skill => {
  const expiresOn = dateAhead(expiryOffset);
  const status: Skill['status'] =
    expiryOffset < 0 ? 'Expired' : expiryOffset <= 21 ? 'Expiring' : 'Valid';
  return { name, certification, expiresOn, status };
};

export const sampleWorkers: Worker[] = [
  // ---------------- Construction ----------------
  {
    id: 'CW-001',
    name: 'Ramesh Kumar',
    profession: 'Mason',
    role: 'Mason',
    industry: 'construction',
    workplace: 'Tower B Site, Sector 21',
    hourlyRate: 85,
    shiftStart: '08:00',
    shiftEnd: '17:00',
    avatarColor: '#d97706',
    skills: [
      skill('Brickwork', 'ITI Masonry Certificate', 120),
      skill('Scaffolding', 'Scaffold Safety Card', 15),
      skill('Working at Heights', 'Height Safety Permit', 200),
    ],
  },
  {
    id: 'CW-002',
    name: 'Sita Devi',
    profession: 'Site Helper',
    role: 'Site Helper',
    industry: 'construction',
    workplace: 'Tower B Site, Sector 21',
    hourlyRate: 70,
    shiftStart: '08:00',
    shiftEnd: '17:00',
    avatarColor: '#0891b2',
    skills: [
      skill('Material Handling', 'Manual Handling Certificate', 60),
      skill('PPE Use', 'Site Safety Induction', -10),
    ],
  },
  {
    id: 'CW-003',
    name: 'Imran Sheikh',
    profession: 'Scaffolder',
    role: 'Scaffolder',
    industry: 'construction',
    workplace: 'Bridge Project, River Road',
    hourlyRate: 95,
    shiftStart: '07:00',
    shiftEnd: '16:00',
    avatarColor: '#65a30d',
    skills: [
      skill('Scaffolding Erection', 'Advanced Scaffold License', 90),
      skill('Fall Protection', 'Fall Arrest Training', 30),
    ],
  },
  {
    id: 'CW-004',
    name: 'Lakshmi N.',
    profession: 'Crane Operator',
    role: 'Crane Operator',
    industry: 'construction',
    workplace: 'Bridge Project, River Road',
    hourlyRate: 120,
    shiftStart: '07:00',
    shiftEnd: '16:00',
    avatarColor: '#7c3aed',
    skills: [
      skill('Crane Operation', 'Tower Crane Operator License', 45),
      skill('Rigging', 'Rigger Certification', 8),
    ],
  },
  // ---------------- Hospital ----------------
  {
    id: 'HW-001',
    name: 'Anjali Rao',
    profession: 'Nursing Assistant',
    role: 'Sanitation Worker',
    industry: 'hospital',
    workplace: 'City General Hospital, Ward 3',
    hourlyRate: 65,
    shiftStart: '06:00',
    shiftEnd: '14:00',
    avatarColor: '#0d9488',
    skills: [
      skill('Ward Cleaning', 'Hospital Hygiene Training', 75),
      skill('Infection Control', 'Infection Control Certificate', 18),
    ],
  },
  {
    id: 'HW-002',
    name: 'Joseph Thomas',
    profession: 'Patient Support Attendant',
    role: 'Patient Support Attendant',
    industry: 'hospital',
    workplace: 'City General Hospital, ICU',
    hourlyRate: 78,
    shiftStart: '14:00',
    shiftEnd: '22:00',
    avatarColor: '#db2777',
    skills: [
      skill('Patient Handling', 'Patient Mobility Training', 40),
      skill('Basic Life Support', 'BLS Certification', 12),
    ],
  },
  {
    id: 'HW-003',
    name: 'Fatima Begum',
    profession: 'Waste Handling Technician',
    role: 'Waste Handling Staff',
    industry: 'hospital',
    workplace: 'City General Hospital, Bio-Waste Unit',
    hourlyRate: 70,
    shiftStart: '22:00',
    shiftEnd: '06:00',
    avatarColor: '#2563eb',
    skills: [
      skill('Bio-Waste Segregation', 'BMW Handling Certificate', 25),
      skill('Spill Management', 'Hazardous Spill Response', -5),
    ],
  },
  {
    id: 'HW-004',
    name: 'Mohit Verma',
    profession: 'Laundry Technician',
    role: 'Laundry Assistant',
    industry: 'hospital',
    workplace: 'City General Hospital, Laundry',
    hourlyRate: 62,
    shiftStart: '08:00',
    shiftEnd: '16:00',
    avatarColor: '#ea580c',
    skills: [
      skill('Linen Handling', 'Linen Mgmt Certificate', 100),
      skill('Infection Control', 'Infection Control Certificate', 60),
    ],
  },
];

const buildAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const make = (worker: Worker, day: Date, inH: number, outH: number) => {
    records.push({
      id: `${worker.id}-${isoDate(day)}`,
      workerId: worker.id,
      industry: worker.industry,
      date: isoDate(day),
      checkIn: atTime(day, inH, 0),
      checkOut: atTime(day, outH, 0),
    });
  };
  for (const w of sampleWorkers) {
    for (let n = 6; n >= 1; n--) {
      const d = daysAgo(n);
      if (d.getDay() === 0) continue; // skip Sundays
      const overtime = n === 2 ? 3 : 0; // one overtime day → overwork alert
      const startH = parseInt(w.shiftStart.slice(0, 2), 10);
      const endH = parseInt(w.shiftEnd.slice(0, 2), 10);
      // hospital night shift wraps midnight
      if (w.industry === 'hospital' && endH <= startH) {
        make(w, d, startH, endH + 24);
      } else {
        make(w, d, 8, 17 + overtime);
      }
    }
  }
  return records;
};

export const sampleAttendance: AttendanceRecord[] = buildAttendance();

const tEntry = (days: number, actor: string, action: string) => ({
  at: daysAgo(days).toISOString(),
  actor,
  action,
});

export const sampleComplaints: Complaint[] = [
  {
    id: 'CMP-001',
    workerId: 'CW-001',
    workerName: 'Ramesh Kumar',
    industry: 'construction',
    workplace: 'Tower B Site, Sector 21',
    category: 'Unsafe Equipment',
    description:
      'The scaffold plank on the third floor is cracked and bends under weight. Needs immediate replacement.',
    urgency: 'High',
    status: 'Under Review',
    assignedTo: 'Priya Menon',
    notes: [
      { at: daysAgo(2).toISOString(), author: 'Priya Menon', text: 'Visited site, plank identified. Replacement ordered.' },
    ],
    timeline: [
      tEntry(3, 'Reporter', 'Complaint submitted'),
      tEntry(2, 'Priya Menon', 'Status moved to Under Review'),
    ],
    createdAt: daysAgo(3).toISOString(),
    updatedAt: daysAgo(2).toISOString(),
  },
  {
    id: 'CMP-002',
    workerId: null,
    workerName: null,
    industry: 'construction',
    workplace: 'Bridge Project, River Road',
    category: 'PPE Missing',
    description:
      'Safety harnesses supplied this week are expired. Workers at height are at risk.',
    urgency: 'High',
    status: 'Submitted',
    assignedTo: null,
    notes: [],
    timeline: [tEntry(1, 'Reporter', 'Complaint submitted (anonymous)')],
    createdAt: daysAgo(1).toISOString(),
    updatedAt: daysAgo(1).toISOString(),
  },
  {
    id: 'CMP-003',
    workerId: 'HW-001',
    workerName: 'Anjali Rao',
    industry: 'hospital',
    workplace: 'City General Hospital, Ward 3',
    category: 'Sanitation Issue',
    description:
      'Disinfectant supply has been irregular for two days. Ward 3 cleaning is delayed.',
    urgency: 'Medium',
    status: 'Action Taken',
    assignedTo: 'Priya Menon',
    notes: [
      { at: daysAgo(3).toISOString(), author: 'Priya Menon', text: 'Raised with stores. Emergency stock dispatched.' },
    ],
    timeline: [
      tEntry(5, 'Reporter', 'Complaint submitted'),
      tEntry(4, 'Priya Menon', 'Status moved to Under Review'),
      tEntry(3, 'Priya Menon', 'Status moved to Action Taken'),
    ],
    createdAt: daysAgo(5).toISOString(),
    updatedAt: daysAgo(3).toISOString(),
  },
  {
    id: 'CMP-004',
    workerId: null,
    workerName: null,
    industry: 'hospital',
    workplace: 'City General Hospital, Bio-Waste Unit',
    category: 'Hazardous Material',
    description:
      'Bio-waste segregation bins are not colour-coded correctly, risking mix-up with general waste.',
    urgency: 'High',
    status: 'Under Review',
    assignedTo: 'Priya Menon',
    notes: [
      { at: daysAgo(1).toISOString(), author: 'Priya Menon', text: 'Awaiting photos from unit in-charge.' },
    ],
    timeline: [
      tEntry(2, 'Reporter', 'Complaint submitted (anonymous)'),
      tEntry(1, 'Priya Menon', 'Status moved to Under Review'),
    ],
    createdAt: daysAgo(2).toISOString(),
    updatedAt: daysAgo(1).toISOString(),
  },
  {
    id: 'CMP-005',
    workerId: 'HW-002',
    workerName: 'Joseph Thomas',
    industry: 'hospital',
    workplace: 'City General Hospital, ICU',
    category: 'Staffing Shortage',
    description:
      'ICU night shift is running with two attendants instead of four. Patient care is at risk.',
    urgency: 'High',
    status: 'Submitted',
    assignedTo: null,
    notes: [],
    timeline: [tEntry(0, 'Reporter', 'Complaint submitted')],
    createdAt: daysAgo(0).toISOString(),
    updatedAt: daysAgo(0).toISOString(),
  },
];

// ---------------- Demo accounts ----------------
// IMPORTANT: These are DEMO credentials for a hackathon prototype only.
// They are NOT secure. No real passwords are handled. Do not reuse real passwords.
// Worker username = worker name (lowercase). Default password = first 3 letters of first name + "123".
const defaultWorkerPassword = (name: string) =>
  name.trim().slice(0, 3) + '123';

export const sampleAccounts: Account[] = [
  // Reviewer
  {
    username: 'reviewer',
    password: 'pri123',
    role: 'reviewer',
    displayName: 'Priya Menon',
  },
  // Employers (one per industry)
  {
    username: 'arjun',
    password: 'arj123',
    role: 'employer',
    displayName: 'Arjun Site Manager',
    industry: 'construction',
  },
  {
    username: 'neha',
    password: 'neh123',
    role: 'employer',
    displayName: 'Dr. Neha Hospital Admin',
    industry: 'hospital',
  },
  // Workers — username = worker name (lowercase), password = first 3 letters + 123
  ...sampleWorkers.map((w) => ({
    username: w.name.toLowerCase(),
    password: defaultWorkerPassword(w.name),
    role: 'worker' as const,
    displayName: w.name,
    workerId: w.id,
    industry: w.industry,
  })),
];

export const industryMeta: Record<
  Industry,
  {
    label: string;
    icon: string;
    tagline: string;
    accent: string;
    gradient: string;
    softBg: string;
    headerBg: string;
    navActive: string;
    navIdle: string;
    badgeTone: string;
    borderTone: string;
  }
> = {
  construction: {
    label: 'Construction',
    icon: 'HardHat',
    tagline: 'Site workforce, overtime & hazard monitoring',
    accent: '#c2410c',
    gradient: 'from-orange-500 via-amber-500 to-yellow-400',
    softBg: 'bg-amber-50',
    headerBg: 'bg-gradient-to-r from-orange-600 to-amber-500',
    navActive: 'bg-amber-100 text-amber-800 ring-1 ring-amber-300',
    navIdle: 'text-amber-900/70 hover:bg-amber-100',
    badgeTone: 'amber',
    borderTone: 'border-amber-300',
  },
  hospital: {
    label: 'Hospital',
    icon: 'Stethoscope',
    tagline: 'Day/night shift, ward coverage & fatigue alerts',
    accent: '#2563eb',
    gradient: 'from-blue-600 via-indigo-500 to-violet-500',
    softBg: 'bg-blue-50',
    headerBg: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    navActive: 'bg-blue-100 text-blue-700 ring-1 ring-blue-300',
    navIdle: 'text-blue-900/70 hover:bg-blue-100',
    badgeTone: 'blue',
    borderTone: 'border-blue-300',
  },
};

export const shiftType = (w: Worker): 'Day' | 'Night' | 'Evening' => {
  const s = parseInt(w.shiftStart.slice(0, 2), 10);
  if (s >= 20 || s < 6) return 'Night';
  if (s >= 14) return 'Evening';
  return 'Day';
};
