"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { getApiBase } from "@/lib/api";
import styles from "./coach.module.css";

const PASSCODE_KEY = "ged-coach-passcode";
const STUDENT_FILTER_KEY = "ged-coach-student-filter";

interface AttemptSummary {
  id: string;
  studentId?: string;
  startedAt: string | null;
  submittedAt: string;
  correct: number;
  total: number;
  percentage: number;
  practiceBand: string;
}

interface TopicAnalytics {
  topic: string;
  itemsAttempted: number;
  itemsCorrect: number;
  accuracy: number;
  recentAccuracy: number | null;
  recentAttemptsConsidered: number;
  coveringAttempts?: number;
  totalMisses?: number;
  weakSittingCount?: number;
  flagged: boolean;
  flagReasons: string[];
  recentMissedQuestionIds: string[];
}

interface AnalyticsPayload {
  studentId: string | null;
  students: string[];
  attemptCount: number;
  attempts: AttemptSummary[];
  topics: TopicAnalytics[];
  flaggedTopics: TopicAnalytics[];
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

export default function CoachPage() {
  const [passcode, setPasscode] = useState("");
  const [authedPasscode, setAuthedPasscode] = useState<string | null>(null);
  const [studentFilter, setStudentFilter] = useState<string>("all");
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadAnalytics = useCallback(
    async (code: string, filter: string) => {
      setLoading(true);
      setError(null);
      try {
        const qs =
          filter && filter !== "all"
            ? `?studentId=${encodeURIComponent(filter)}`
            : "";
        const res = await fetch(`${getApiBase()}/api/coach/analytics${qs}`, {
          headers: { "x-coach-passcode": code },
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            typeof body.error === "string"
              ? body.error
              : "Failed to load analytics"
          );
        }
        setData(body as AnalyticsPayload);
        setAuthedPasscode(code);
        sessionStorage.setItem(PASSCODE_KEY, code);
        sessionStorage.setItem(STUDENT_FILTER_KEY, filter);
      } catch (e) {
        setData(null);
        setAuthedPasscode(null);
        setError(e instanceof Error ? e.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const saved = sessionStorage.getItem(PASSCODE_KEY);
    const savedFilter = sessionStorage.getItem(STUDENT_FILTER_KEY) ?? "all";
    if (saved) {
      setPasscode(saved);
      setStudentFilter(savedFilter);
      void loadAnalytics(saved, savedFilter);
    }
  }, [loadAnalytics]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void loadAnalytics(passcode.trim(), studentFilter);
  };

  const onStudentChange = (value: string) => {
    setStudentFilter(value);
    if (authedPasscode) {
      void loadAnalytics(authedPasscode, value);
    }
  };

  const logout = () => {
    sessionStorage.removeItem(PASSCODE_KEY);
    sessionStorage.removeItem(STUDENT_FILTER_KEY);
    setAuthedPasscode(null);
    setData(null);
    setPasscode("");
    setStudentFilter("all");
  };

  const students = data?.students ?? [];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Coach</p>
          <h1>Weakness review</h1>
          <p className={styles.sub}>
            Topic flags from each student’s practice history — no LLM. Filter by
            practice ID to see one learner at a time.
          </p>
        </div>
        <Link href="/" className={styles.link}>
          Student home
        </Link>
      </header>

      {!authedPasscode ? (
        <form className={styles.gate} onSubmit={onSubmit}>
          <label htmlFor="coach-pass">
            Coach passcode
            <input
              id="coach-pass"
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit" disabled={loading || !passcode.trim()}>
            {loading ? "Checking…" : "Open dashboard"}
          </button>
          {error ? <p className={styles.error}>{error}</p> : null}
        </form>
      ) : (
        <div className={styles.dashboard}>
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <p>
                {data?.attemptCount ?? 0} attempt
                {(data?.attemptCount ?? 0) === 1 ? "" : "s"}
                {studentFilter !== "all" ? ` · ${studentFilter}` : " · all students"}
              </p>
              <label className={styles.filterLabel} htmlFor="student-filter">
                Student
                <select
                  id="student-filter"
                  value={studentFilter}
                  onChange={(e) => onStudentChange(e.target.value)}
                >
                  <option value="all">All students</option>
                  {students.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className={styles.toolbarActions}>
              <button
                type="button"
                className={styles.secondary}
                onClick={() =>
                  authedPasscode &&
                  void loadAnalytics(authedPasscode, studentFilter)
                }
                disabled={loading}
              >
                Refresh
              </button>
              <button type="button" className={styles.secondary} onClick={logout}>
                Lock
              </button>
            </div>
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}
          {loading && !data ? (
            <p className={styles.muted}>Loading…</p>
          ) : null}

          {data ? (
            <>
              <section className={styles.section}>
                <h2>Flagged topics</h2>
                {data.flaggedTopics.length === 0 ? (
                  <p className={styles.muted}>
                    No topics flagged yet. Flags need ≥5 tests covering the
                    topic and ≥5 missed items, plus either overall accuracy
                    &lt; 70% or weak sittings on all of the last 5 covering
                    tests (1-item topics: any miss; 2-item: both wrong; 3+:
                    ≥50% wrong that day).
                  </p>
                ) : (
                  <ul className={styles.flagList}>
                    {data.flaggedTopics.map((t) => (
                      <li key={t.topic} className={styles.flagCard}>
                        <button
                          type="button"
                          className={styles.flagHead}
                          onClick={() =>
                            setExpanded((cur) =>
                              cur === t.topic ? null : t.topic
                            )
                          }
                        >
                          <span className={styles.topicName}>{t.topic}</span>
                          <span className={styles.badge}>
                            {pct(t.accuracy)} overall
                          </span>
                        </button>
                        <ul className={styles.reasons}>
                          {t.flagReasons.map((r) => (
                            <li key={r}>{r}</li>
                          ))}
                        </ul>
                        {expanded === t.topic ? (
                          <div className={styles.detail}>
                            <p>
                              Items: {t.itemsCorrect}/{t.itemsAttempted} ·
                              Tests: {t.coveringAttempts ?? "—"} · Weak
                              sittings: {t.weakSittingCount ?? "—"} · Recent:{" "}
                              {t.recentAccuracy === null
                                ? "n/a"
                                : pct(t.recentAccuracy)}{" "}
                              (last {t.recentAttemptsConsidered} attempts)
                            </p>
                            {t.recentMissedQuestionIds.length > 0 ? (
                              <p className={styles.mono}>
                                Recent misses:{" "}
                                {t.recentMissedQuestionIds.join(", ")}
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className={styles.section}>
                <h2>All topics</h2>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Topic</th>
                        <th>Accuracy</th>
                        <th>Items</th>
                        <th>Tests</th>
                        <th>Weak</th>
                        <th>Recent</th>
                        <th>Flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topics.map((t) => (
                        <tr
                          key={t.topic}
                          className={t.flagged ? styles.rowFlagged : undefined}
                        >
                          <td>{t.topic}</td>
                          <td>{pct(t.accuracy)}</td>
                          <td>
                            {t.itemsCorrect}/{t.itemsAttempted}
                          </td>
                          <td>{t.coveringAttempts ?? "—"}</td>
                          <td>{t.weakSittingCount ?? "—"}</td>
                          <td>
                            {t.recentAccuracy === null
                              ? "—"
                              : pct(t.recentAccuracy)}
                          </td>
                          <td>{t.flagged ? "Yes" : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className={styles.section}>
                <h2>Score history</h2>
                {data.attempts.length === 0 ? (
                  <p className={styles.muted}>No attempts saved yet.</p>
                ) : (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          {studentFilter === "all" ? <th>Student</th> : null}
                          <th>Submitted</th>
                          <th>Score</th>
                          <th>%</th>
                          <th>Band</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.attempts.map((a) => (
                          <tr key={a.id}>
                            {studentFilter === "all" ? (
                              <td>{a.studentId ?? "—"}</td>
                            ) : null}
                            <td>
                              {new Date(a.submittedAt).toLocaleString()}
                            </td>
                            <td>
                              {a.correct}/{a.total}
                            </td>
                            <td>{a.percentage}%</td>
                            <td>{a.practiceBand}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
