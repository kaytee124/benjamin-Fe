"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MATH_SUBJECT } from "@/lib/constants";
import {
  clearAttempt,
  clearResults,
  loadStudentId,
  normalizeStudentId,
  saveStudentId,
} from "@/lib/storage";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const [practiceId, setPracticeId] = useState("");
  const [idError, setIdError] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadStudentId();
    if (saved) setPracticeId(saved);
  }, []);

  const startTest = () => {
    const id = normalizeStudentId(practiceId);
    if (!id) {
      setIdError("Enter a practice name or ID (letters, numbers, - or _).");
      return;
    }
    saveStudentId(id);
    setIdError(null);
    clearAttempt();
    clearResults();
    router.push("/test/math");
  };

  return (
    <div className={styles.page}>
      <main className={styles.hero}>
        <p className={styles.brand}>GED Practice</p>
        <h1 className={styles.title}>Mathematical Reasoning</h1>
        <p className={styles.lede}>
          A timed practice test that mirrors the computer-based Math exam:
          free navigation, end-of-test scoring, calculator rules for the first
          five questions, and a fresh generated question set each attempt.
        </p>

        <dl className={styles.meta}>
          <div>
            <dt>Questions</dt>
            <dd>{MATH_SUBJECT.questionCount}</dd>
          </div>
          <div>
            <dt>Time limit</dt>
            <dd>{MATH_SUBJECT.timeLimitMinutes} minutes</dd>
          </div>
          <div>
            <dt>No calculator</dt>
            <dd>Questions 1–{MATH_SUBJECT.noCalculatorCount}</dd>
          </div>
        </dl>

        <label className={styles.practiceLabel} htmlFor="practice-id">
          Practice name / ID
          <input
            id="practice-id"
            className={styles.practiceInput}
            type="text"
            value={practiceId}
            onChange={(e) => {
              setPracticeId(e.target.value);
              setIdError(null);
            }}
            placeholder="e.g. benjamin"
            autoComplete="username"
            maxLength={64}
          />
        </label>
        <p className={styles.practiceHint}>
          Your misses stay under this ID so later forms can practice proven
          weak topics — not everyone else’s.
        </p>
        {idError ? <p className={styles.idError}>{idError}</p> : null}

        <div className={styles.ctaRow}>
          <button type="button" className={styles.cta} onClick={startTest}>
            Start Math practice test
          </button>
          <button
            type="button"
            className={styles.secondaryCta}
            onClick={() => {
              const id = normalizeStudentId(practiceId);
              if (!id) {
                setIdError(
                  "Enter a practice name or ID (letters, numbers, - or _)."
                );
                return;
              }
              saveStudentId(id);
              setIdError(null);
              router.push("/history");
            }}
          >
            View my test history
          </button>
        </div>

        <p className={styles.note}>
          Scoring is a raw practice percentage — not an official GED 100–200
          scaled score. Answers are graded only after you submit.
        </p>
        <p className={styles.coachLink}>
          <a href="/history">Test history</a>
          {" · "}
          <a href="/coach">Coach review</a>
        </p>
      </main>
    </div>
  );
}
