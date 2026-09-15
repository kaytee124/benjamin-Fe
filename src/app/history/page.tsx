"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchAttempts } from "@/lib/api";
import {
  loadStudentId,
  normalizeStudentId,
  saveStudentId,
} from "@/lib/storage";
import type { AttemptSummary } from "@/lib/types";
import styles from "./history.module.css";

export default function HistoryPage() {
  const router = useRouter();
  const [practiceId, setPracticeId] = useState("");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAttempts(id);
      setStudentId(data.studentId);
      setAttempts(data.attempts);
      saveStudentId(data.studentId);
    } catch (err) {
      setAttempts([]);
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = loadStudentId();
    if (saved) {
      setPracticeId(saved);
      void loadHistory(saved);
    }
  }, [loadHistory]);

  const onLookup = () => {
    const id = normalizeStudentId(practiceId);
    if (!id) {
      setError("Enter a practice name or ID (letters, numbers, - or _).");
      return;
    }
    void loadHistory(id);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>GED Practice</p>
          <h1>Your test history</h1>
          <p className={styles.sub}>
            Past Math practice scores for your practice name / ID.
          </p>
        </div>
        <Link href="/" className={styles.link}>
          Home
        </Link>
      </header>

      <div className={styles.lookup}>
        <label htmlFor="history-id">
          Practice name / ID
          <input
            id="history-id"
            type="text"
            value={practiceId}
            onChange={(e) => setPracticeId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onLookup();
            }}
            placeholder="e.g. benjamin"
            maxLength={64}
            autoComplete="username"
          />
        </label>
        <button type="button" onClick={onLookup} disabled={loading}>
          {loading ? "Loading…" : "Show scores"}
        </button>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      {studentId && !loading && !error ? (
        <section className={styles.section} aria-labelledby="history-heading">
          <h2 id="history-heading">
            Scores for <span className={styles.mono}>{studentId}</span>
          </h2>
          {attempts.length === 0 ? (
            <p className={styles.muted}>
              No saved attempts yet. Take a practice test to build history.
            </p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Submitted</th>
                    <th>Score</th>
                    <th>%</th>
                    <th>Band</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a) => (
                    <tr key={a.id}>
                      <td>{new Date(a.submittedAt).toLocaleString()}</td>
                      <td>
                        {a.correct}/{a.total}
                      </td>
                      <td>{a.percentage}%</td>
                      <td>{a.practiceBand}</td>
                      <td>
                        <Link
                          href={`/history/${a.id}`}
                          className={styles.rowLink}
                        >
                          View questions
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primary}
              onClick={() => router.push("/test/math")}
            >
              Start another test
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
