import type { AttemptSummary } from "@/lib/types";

/** Production benjamin-be (public for now). */
export const API_BASE = "https://benjamin-be-2.onrender.com";

/** Base URL for benjamin-be (no trailing slash). */
export function getApiBase(): string {
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return "http://localhost:4000";
  }
  return API_BASE;
}

export interface AttemptsResponse {
  studentId: string;
  attempts: AttemptSummary[];
}

/** Load scored test history for a practice ID. */
export async function fetchAttempts(
  studentId: string
): Promise<AttemptsResponse> {
  const res = await fetch(
    `${getApiBase()}/api/subjects/math/attempts?studentId=${encodeURIComponent(studentId)}`
  );
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof body.error === "string" ? body.error : "Failed to load history"
    );
  }
  return body as AttemptsResponse;
}
