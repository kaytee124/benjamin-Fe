import { STORAGE_KEY, RESULTS_KEY, STUDENT_ID_KEY } from "./constants";
import type { PublicQuestion, SubmitResponse } from "./types";

export interface AttemptState {
  startedAt: string;
  sessionId: string;
  studentId: string;
  answers: Record<string, string>;
  flagged: string[];
  currentIndex: number;
  /** Cached public questions for offline-ish resume; revalidated via session API. */
  questions?: PublicQuestion[];
}

/** Normalize practice name/ID the same way the API does. */
export function normalizeStudentId(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function loadStudentId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STUDENT_ID_KEY);
    if (!raw) return null;
    const id = normalizeStudentId(raw);
    return id || null;
  } catch {
    return null;
  }
}

export function saveStudentId(raw: string): string | null {
  if (typeof window === "undefined") return null;
  const id = normalizeStudentId(raw);
  if (!id) return null;
  localStorage.setItem(STUDENT_ID_KEY, id);
  return id;
}

export function loadAttempt(): AttemptState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AttemptState;
  } catch {
    return null;
  }
}

export function saveAttempt(state: AttemptState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearAttempt(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function saveResults(results: SubmitResponse): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}

export function loadResults(): SubmitResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SubmitResponse;
  } catch {
    return null;
  }
}

export function clearResults(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RESULTS_KEY);
}

export function remainingMs(startedAt: string, timeLimitMinutes: number): number {
  const elapsed = Date.now() - new Date(startedAt).getTime();
  return Math.max(0, timeLimitMinutes * 60 * 1000 - elapsed);
}

export function formatTime(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}
