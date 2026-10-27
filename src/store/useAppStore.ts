import { useEffect, useState, useCallback } from 'react';
import type {
  AppState,
  Industry,
  Role,
  AttendanceRecord,
  Complaint,
  ComplaintStatus,
  Worker,
  Account,
  Session,
  CaseNote,
  ComplaintCategory,
} from '../types';
import {
  sampleWorkers,
  sampleAttendance,
  sampleComplaints,
  sampleAccounts,
} from '../data/sampleData';

const STORAGE_KEY = 'fairshift-state-v5';

const recomputeSkillStatus = (w: Worker): Worker => ({
  ...w,
  skills: w.skills.map((s) => {
    const today = new Date();
    const exp = new Date(s.expiresOn + 'T00:00:00');
    const days = Math.round((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const status = days < 0 ? 'Expired' : days <= 21 ? 'Expiring' : 'Valid';
    return { ...s, status };
  }),
});

const initialState: AppState = {
  industry: 'construction',
  session: null,
  workers: sampleWorkers.map(recomputeSkillStatus),
  attendance: sampleAttendance,
  complaints: sampleComplaints,
  accounts: sampleAccounts,
  flaggedPay: ['CW-002'], // one seeded pay discrepancy flag
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.workers || !parsed.attendance || !parsed.complaints || !parsed.accounts) {
      return initialState;
    }
    // keep skill status fresh on load
    return {
      ...initialState,
      ...parsed,
      workers: (parsed.workers ?? initialState.workers).map(recomputeSkillStatus),
    };
  } catch {
    return initialState;
  }
}

let listeners: Array<() => void> = [];
let currentState: AppState = loadState();

const persist = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
  } catch {
    /* ignore quota errors */
  }
  listeners.forEach((l) => l());
};

export const useAppStore = () => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const l = () => setTick((t) => t + 1);
    listeners.push(l);
    return () => {
      listeners = listeners.filter((x) => x !== l);
    };
  }, []);

  const state = currentState;

  // ---------- auth ----------
  const login = useCallback((username: string, password: string): { ok: boolean; error?: string } => {
    const acct = currentState.accounts.find(
      (a) => a.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (!acct) return { ok: false, error: 'No demo account with that username.' };
    if (acct.password.toLowerCase() !== password.trim().toLowerCase())
      return { ok: false, error: 'Incorrect password. Check the demo credentials.' };
    const session: Session = {
      username: acct.username,
      role: acct.role,
      displayName: acct.displayName,
      workerId: acct.workerId,
      industry: acct.industry,
    };
    const industry =
      acct.role === 'worker'
        ? acct.industry ?? currentState.industry
        : acct.role === 'employer'
        ? acct.industry ?? currentState.industry
        : currentState.industry;
    currentState = { ...currentState, session, industry };
    persist();
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    currentState = { ...currentState, session: null };
    persist();
  }, []);

  // ---------- navigation helpers ----------
  const setIndustry = useCallback((industry: Industry) => {
    currentState = { ...currentState, industry };
    persist();
  }, []);

  // ---------- worker selection (scoped) ----------
  const selectWorker = useCallback((workerId: string) => {
    currentState = { ...currentState };
    persist();
  }, []);

  // ---------- attendance ----------
  const checkIn = useCallback((workerId: string) => {
    const worker = currentState.workers.find((w) => w.id === workerId);
    if (!worker) return;
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const existing = currentState.attendance.find(
      (a) => a.workerId === workerId && a.date === date
    );
    if (existing && !existing.checkOut) return;
    const record: AttendanceRecord = {
      id: `${workerId}-${date}-${Date.now()}`,
      workerId,
      industry: worker.industry,
      date,
      checkIn: now.toISOString(),
      checkOut: null,
    };
    currentState = {
      ...currentState,
      attendance: [...currentState.attendance, record],
    };
    persist();
  }, []);

  const checkOut = useCallback((workerId: string) => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    currentState = {
      ...currentState,
      attendance: currentState.attendance.map((a) =>
        a.workerId === workerId && a.date === date && !a.checkOut
          ? { ...a, checkOut: now.toISOString() }
          : a
      ),
    };
    persist();
  }, []);

  // ---------- workers (employer) ----------
  const addWorker = useCallback(
    (data: {
      name: string;
      profession: string;
      industry: Industry;
      workplace: string;
      hourlyRate: number;
      shiftStart: string;
      shiftEnd: string;
    }): { ok: boolean; error?: string; worker?: Worker; username?: string; password?: string } => {
      const prefix = data.industry === 'construction' ? 'CW' : 'HW';
      const existing = currentState.workers.filter((w) => w.id.startsWith(prefix));
      const next = existing.length + 1 + 4; // avoid clashing with seeded 1-4
      // find a free id
      let id = `${prefix}-${String(next).padStart(3, '0')}`;
      while (currentState.workers.some((w) => w.id === id)) {
        const n = parseInt(id.split('-')[1], 10) + 1;
        id = `${prefix}-${String(n).padStart(3, '0')}`;
      }
      const colors = ['#0d9488', '#2563eb', '#d97706', '#db2777', '#65a30d', '#7c3aed', '#ea580c'];
      const worker: Worker = {
        id,
        name: data.name.trim(),
        profession: data.profession.trim(),
        role: data.profession.trim(),
        industry: data.industry,
        workplace: data.workplace.trim(),
        hourlyRate: data.hourlyRate,
        shiftStart: data.shiftStart,
        shiftEnd: data.shiftEnd,
        avatarColor: colors[existing.length % colors.length],
        skills: [],
      };
      const username = worker.name.toLowerCase();
      const password = worker.name.trim().slice(0, 3) + '123';
      const account: Account = {
        username,
        password,
        role: 'worker',
        displayName: worker.name,
        workerId: id,
        industry: data.industry,
      };
      currentState = {
        ...currentState,
        workers: [...currentState.workers, worker],
        accounts: [...currentState.accounts, account],
      };
      persist();
      return { ok: true, worker, username, password };
    },
    []
  );

  // ---------- complaints ----------
  const addComplaint = useCallback(
    (c: {
      workerId: string | null;
      workerName: string | null;
      industry: Industry;
      workplace: string;
      category: ComplaintCategory;
      description: string;
      urgency: 'Low' | 'Medium' | 'High';
    }) => {
      const num = currentState.complaints.length + 1;
      const id = `CMP-${String(num).padStart(3, '0')}`;
      const now = new Date().toISOString();
      const complaint: Complaint = {
        ...c,
        id,
        status: 'Submitted',
        assignedTo: null,
        notes: [],
        timeline: [
          {
            at: now,
            actor: 'Reporter',
            action: c.workerId ? 'Complaint submitted' : 'Complaint submitted (anonymous)',
          },
        ],
        createdAt: now,
        updatedAt: now,
      };
      currentState = {
        ...currentState,
        complaints: [complaint, ...currentState.complaints],
      };
      persist();
      return id;
    },
    []
  );

  const setComplaintStatus = useCallback(
    (id: string, status: ComplaintStatus, actorName: string) => {
      const now = new Date().toISOString();
      currentState = {
        ...currentState,
        complaints: currentState.complaints.map((c) =>
          c.id === id
            ? {
                ...c,
                status,
                updatedAt: now,
                timeline: [
                  ...c.timeline,
                  { at: now, actor: actorName, action: `Status moved to ${status}` },
                ],
              }
            : c
        ),
      };
      persist();
    },
    []
  );

  const assignComplaint = useCallback((id: string, reviewerName: string, actorName: string) => {
    const now = new Date().toISOString();
    currentState = {
      ...currentState,
      complaints: currentState.complaints.map((c) =>
        c.id === id
          ? {
              ...c,
              assignedTo: reviewerName,
              updatedAt: now,
              timeline: [
                ...c.timeline,
                { at: now, actor: actorName, action: `Assigned to ${reviewerName}` },
              ],
            }
          : c
      ),
    };
    persist();
  }, []);

  const addCaseNote = useCallback((id: string, note: Omit<CaseNote, 'at'>) => {
    const now = new Date().toISOString();
    currentState = {
      ...currentState,
      complaints: currentState.complaints.map((c) =>
        c.id === id
          ? {
              ...c,
              notes: [...c.notes, { ...note, at: now }],
              updatedAt: now,
              timeline: [
                ...c.timeline,
                { at: now, actor: note.author, action: 'Case note added' },
              ],
            }
          : c
      ),
    };
    persist();
  }, []);

  // ---------- pay flagging ----------
  const flagPayDiscrepancy = useCallback((workerId: string) => {
    if (currentState.flaggedPay.includes(workerId)) return;
    currentState = { ...currentState, flaggedPay: [...currentState.flaggedPay, workerId] };
    persist();
  }, []);

  const clearPayFlag = useCallback((workerId: string) => {
    currentState = {
      ...currentState,
      flaggedPay: currentState.flaggedPay.filter((id) => id !== workerId),
    };
    persist();
  }, []);

  // ---------- change password ----------
  const changePassword = useCallback(
    (username: string, currentPassword: string, newPassword: string): { ok: boolean; error?: string } => {
      const acct = currentState.accounts.find(
        (a) => a.username.toLowerCase() === username.trim().toLowerCase()
      );
      if (!acct) return { ok: false, error: 'Account not found.' };
      if (acct.password !== currentPassword)
        return { ok: false, error: 'Current password is incorrect.' };
      if (newPassword.length < 4)
        return { ok: false, error: 'New password must be at least 4 characters.' };
      currentState = {
        ...currentState,
        accounts: currentState.accounts.map((a) =>
          a.username === acct.username ? { ...a, password: newPassword } : a
        ),
      };
      persist();
      return { ok: true };
    },
    []
  );

  // ---------- reset ----------
  const resetDemoData = useCallback(() => {
    currentState = { ...initialState, industry: currentState.industry };
    persist();
  }, []);

  return {
    state,
    login,
    logout,
    setIndustry,
    selectWorker,
    checkIn,
    checkOut,
    addWorker,
    addComplaint,
    setComplaintStatus,
    assignComplaint,
    addCaseNote,
    flagPayDiscrepancy,
    clearPayFlag,
    changePassword,
    resetDemoData,
  };
};

export type AppStore = ReturnType<typeof useAppStore>;

// ---- calculations (preserved) ----
const MS_PER_HOUR = 1000 * 60 * 60;

export interface ShiftResult {
  hoursWorked: number;
  standardHours: number;
  overtimeHours: number;
  basicPay: number;
  overtimePay: number;
  deductions: number;
  totalPay: number;
}

export function calcShift(record: AttendanceRecord, worker: Worker): ShiftResult {
  if (!record.checkOut) {
    return {
      hoursWorked: 0,
      standardHours: 0,
      overtimeHours: 0,
      basicPay: 0,
      overtimePay: 0,
      deductions: 0,
      totalPay: 0,
    };
  }
  const inTime = new Date(record.checkIn);
  const outTime = new Date(record.checkOut);
  const hoursWorked = Math.max(0, (outTime.getTime() - inTime.getTime()) / MS_PER_HOUR);
  const standardHours = Math.min(8, hoursWorked);
  const overtimeHours = Math.max(0, hoursWorked - 8);
  const basicPay = standardHours * worker.hourlyRate;
  const overtimePay = overtimeHours * worker.hourlyRate * 1.5;
  const deductions = Math.round((basicPay + overtimePay) * 0.02 * 100) / 100;
  const totalPay = Math.round((basicPay + overtimePay - deductions) * 100) / 100;
  return {
    hoursWorked: Math.round(hoursWorked * 100) / 100,
    standardHours: Math.round(standardHours * 100) / 100,
    overtimeHours: Math.round(overtimeHours * 100) / 100,
    basicPay: Math.round(basicPay * 100) / 100,
    overtimePay: Math.round(overtimePay * 100) / 100,
    deductions,
    totalPay,
  };
}

export function workerAttendanceToday(
  state: AppState,
  workerId: string
): AttendanceRecord | undefined {
  const today = new Date().toISOString().slice(0, 10);
  return state.attendance.find(
    (a) => a.workerId === workerId && a.date === today
  );
}

export function workerHistory(
  state: AppState,
  workerId: string
): AttendanceRecord[] {
  return state.attendance
    .filter((a) => a.workerId === workerId)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function workerComplaints(
  state: AppState,
  workerId: string
): Complaint[] {
  return state.complaints
    .filter((c) => c.workerId === workerId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function weeklyEarnings(state: AppState, worker: Worker): ShiftResult {
  const last7 = new Date();
  last7.setDate(last7.getDate() - 7);
  const records = state.attendance.filter(
    (a) => a.workerId === worker.id && a.checkOut && new Date(a.checkIn) >= last7
  );
  const totals = records.reduce(
    (acc, r) => {
      const s = calcShift(r, worker);
      acc.hoursWorked += s.hoursWorked;
      acc.standardHours += s.standardHours;
      acc.overtimeHours += s.overtimeHours;
      acc.basicPay += s.basicPay;
      acc.overtimePay += s.overtimePay;
      acc.deductions += s.deductions;
      acc.totalPay += s.totalPay;
      return acc;
    },
    {
      hoursWorked: 0,
      standardHours: 0,
      overtimeHours: 0,
      basicPay: 0,
      overtimePay: 0,
      deductions: 0,
      totalPay: 0,
    }
  );
  return {
    hoursWorked: Math.round(totals.hoursWorked * 100) / 100,
    standardHours: Math.round(totals.standardHours * 100) / 100,
    overtimeHours: Math.round(totals.overtimeHours * 100) / 100,
    basicPay: Math.round(totals.basicPay * 100) / 100,
    overtimePay: Math.round(totals.overtimePay * 100) / 100,
    deductions: Math.round(totals.deductions * 100) / 100,
    totalPay: Math.round(totals.totalPay * 100) / 100,
  };
}

// ---- fatigue / rest analysis ----
export interface FatigueRisk {
  level: 'Low' | 'Moderate' | 'High';
  reasons: string[];
}

export function fatigueRiskFor(state: AppState, worker: Worker): FatigueRisk {
  const records = workerHistory(state, worker.id).filter((r) => r.checkOut).slice(0, 7);
  const reasons: string[] = [];
  let level: FatigueRisk['level'] = 'Low';

  const longShifts = records.filter((r) => {
    const s = calcShift(r, worker);
    return s.hoursWorked > 10;
  }).length;
  if (longShifts > 0) {
    reasons.push(`${longShifts} shift(s) over 10 hours this week.`);
    level = 'Moderate';
  }

  // rest gap between consecutive shifts
  for (let i = 0; i < records.length - 1; i++) {
    const cur = new Date(records[i].checkOut!);
    const prev = new Date(records[i + 1].checkOut!);
    const nextCheckIn = records[i + 1].checkIn;
    const gapH = (new Date(nextCheckIn).getTime() - cur.getTime()) / MS_PER_HOUR;
    if (gapH < 11) {
      reasons.push(`Less than 11h rest before the shift on ${new Date(nextCheckIn).toLocaleDateString()}.`);
      level = 'High';
    }
    if (prev && false) break; // guard placeholder
  }

  // night shift + long hours for hospital
  if (worker.industry === 'hospital') {
    const startH = parseInt(worker.shiftStart.slice(0, 2), 10);
    if (startH >= 20 || startH < 6) {
      reasons.push('Night shift rotation — monitor cumulative fatigue.');
      if (level === 'Low') level = 'Moderate';
    }
  }

  if (reasons.length === 0) reasons.push('No fatigue risk detected from recent shifts.');
  return { level, reasons };
}

export function isOverdue(c: Complaint): boolean {
  if (c.status === 'Closed' || c.status === 'Action Taken') return false;
  const ageDays = (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return ageDays > 2;
}
