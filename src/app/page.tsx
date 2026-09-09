"use client";

import { useRouter } from "next/navigation";
import { MATH_SUBJECT } from "@/lib/constants";
import { clearAttempt, clearResults } from "@/lib/storage";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();

  const startTest = () => {
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
          free navigation, end-of-test scoring, and calculator rules for the
          first five questions.
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

        <div className={styles.ctaRow}>
          <button type="button" className={styles.cta} onClick={startTest}>
            Start Math practice test
          </button>
        </div>

        <p className={styles.note}>
          Scoring is a raw practice percentage — not an official GED 100–200
          scaled score. Answers are graded only after you submit.
        </p>
      </main>
    </div>
  );
}
