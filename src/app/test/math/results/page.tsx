"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAttempt, clearResults, loadResults } from "@/lib/storage";
import type { SubmitResponse } from "@/lib/types";
import styles from "./results.module.css";

export default function MathResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<SubmitResponse | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setResults(loadResults());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return <p className={styles.loading}>Loading results…</p>;
  }

  if (!results) {
    return (
      <div className={styles.empty}>
        <h1>No results yet</h1>
        <p>Take the Math practice test to see your score.</p>
        <Link href="/" className={styles.primary}>
          Back to start
        </Link>
      </div>
    );
  }

  const { score, practiceBand, review } = results;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Mathematical Reasoning</p>
        <h1>Your results</h1>
        <p className={styles.disclaimer}>
          Practice score only — not an official GED scaled score (100–200).
        </p>
      </header>

      <section className={styles.summary}>
        <div className={styles.scoreBlock}>
          <p className={styles.scoreLabel}>Raw score</p>
          <p className={styles.scoreValue}>
            {score.correct}
            <span> / {score.total}</span>
          </p>
          <p className={styles.pct}>{score.percentage}%</p>
        </div>
        <div className={styles.bandBlock}>
          <p className={styles.scoreLabel}>Practice readiness</p>
          <p className={styles.band}>{practiceBand}</p>
          <p className={styles.bandHint}>
            Approximate bands for practice: under ~73% below threshold, 73%+
            practice passing, 85%+ strong.
          </p>
        </div>
      </section>

      <div className={styles.actions}>
        <Link href="/" className={styles.secondary}>
          Home
        </Link>
        <button
          type="button"
          className={styles.primary}
          onClick={() => {
            clearResults();
            clearAttempt();
            router.push("/test/math");
          }}
        >
          Retake Math test
        </button>
      </div>

      <section className={styles.review} aria-labelledby="review-heading">
        <h2 id="review-heading">Question review</h2>
        <ol className={styles.list}>
          {review.map((item, i) => (
            <li
              key={item.questionId}
              className={`${styles.item} ${item.isCorrect ? styles.correct : styles.incorrect}`}
            >
              <div className={styles.itemHead}>
                <span className={styles.qnum}>Q{i + 1}</span>
                <span className={styles.badge}>
                  {item.isCorrect ? "Correct" : "Incorrect"}
                </span>
                {item.topic ? (
                  <span className={styles.topic}>{item.topic}</span>
                ) : null}
              </div>
              <p className={styles.prompt}>{item.prompt}</p>
              {item.figureSvg ? (
                <div
                  className={styles.figure}
                  dangerouslySetInnerHTML={{ __html: item.figureSvg }}
                />
              ) : null}
              <dl className={styles.answers}>
                <div>
                  <dt>Your answer</dt>
                  <dd>{item.studentAnswer ?? "(blank)"}</dd>
                </div>
                <div>
                  <dt>Correct answer</dt>
                  <dd>{item.correctAnswer}</dd>
                </div>
              </dl>
              {item.explanation ? (
                <p className={styles.explanation}>{item.explanation}</p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
