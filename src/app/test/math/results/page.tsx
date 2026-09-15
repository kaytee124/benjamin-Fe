"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AttemptReview } from "@/components/AttemptReview";
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

  return (
    <AttemptReview
      score={results.score}
      practiceBand={results.practiceBand}
      review={results.review}
      actions={
        <>
          <Link href="/" className={styles.secondary}>
            Home
          </Link>
          <Link href="/history" className={styles.secondary}>
            Test history
          </Link>
          {results.attemptId ? (
            <Link
              href={`/history/${results.attemptId}`}
              className={styles.secondary}
            >
              Saved review
            </Link>
          ) : null}
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
        </>
      }
    />
  );
}
