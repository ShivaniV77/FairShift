export type Industry = 'construction' | 'hospital';
export type Role = 'worker' | 'employer' | 'reviewer';
export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Action Taken'
  | 'Closed';

export type ComplaintCategory =
  | 'Unsafe Equipment'
  | 'Hazardous Material'
  | 'Structural Risk'
  | 'PPE Missing'
  | 'Sanitation Issue'
  | 'Electrical Hazard'
  | 'Long Working Hours'
  | 'Staffing Shortage'
  | 'Other';

export interface Skill {
  name: string;
  certification: string;     // cert name
  expiresOn: string;         // YYYY-MM-DD
  status: 'Valid' | 'Expiring' | 'Expired';
}

export interface Worker {
  id: string;
  name: string;
  profession: string;        // e.g. Mason, Nursing Assistant
  role: string;              // kept for backwards-compat display
  industry: Industry;
  workplace: string;
  hourlyRate: number;        // base pay per hour
  shiftStart: string;        // "08:00"
  shiftEnd: string;          // "17:00"
  avatarColor: string;
  skills: Skill[];
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  industry: Industry;
  date: string;              // YYYY-MM-DD
  checkIn: string;           // ISO timestamp
  checkOut: string | null;   // ISO timestamp or null if still checked in
}

export interface TimelineEntry {
  at: string;                // ISO timestamp
  actor: string;             // actor display name or 'Reporter'
  action: string;            // human-readable
}

export interface CaseNote {
  at: string;
  author: string;
  text: string;
}

export interface Complaint {
  id: string;                // complaint ID e.g. CMP-001
  workerId: string | null;   // null = anonymous
  workerName: string | null; // null = anonymous (also kept separately, hidden from employer)
  industry: Industry;
  workplace: string;
  category: ComplaintCategory;
  description: string;
  urgency: 'Low' | 'Medium' | 'High';
  status: ComplaintStatus;
  assignedTo: string | null; // reviewer name
  notes: CaseNote[];
  timeline: TimelineEntry[];
  createdAt: string;         // ISO timestamp
  updatedAt: string;         // ISO timestamp
}

export interface Account {
  username: string;          // login id (worker id, employer id, or reviewer id)
  password: string;          // demo password only — NOT secure
  role: Role;
  displayName: string;
  workerId?: string;         // for worker accounts
  industry?: Industry;       // worker industry / employer scope
}

export interface Session {
  username: string;
  role: Role;
  displayName: string;
  workerId?: string;
  industry?: Industry;
}

export interface AppState {
  industry: Industry;
  session: Session | null;
  workers: Worker[];
  attendance: AttendanceRecord[];
  complaints: Complaint[];
  accounts: Account[];
  flaggedPay: string[];      // worker ids with a flagged pay discrepancy
}
