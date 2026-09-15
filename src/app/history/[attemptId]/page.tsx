"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AttemptReview } from "@/components/AttemptReview";
import { fetchAttempt, type AttemptDetailResponse } from "@/lib/api";
import { loadStudentId } from "@/lib/storage";
import styles from "@/app/test/math/results/results.module.css";

export default function HistoryAttemptPage() {
  const params = useParams();
  const attemptId =
    typeof params.attemptId === "string" ? params.attemptId : "";
  const [data, setData] = useState<AttemptDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const studentId = loadStudentId();
    if (!studentId) {
      setError("Enter your practice name on the history page first.");
      setLoaded(true);
      return;
    }
    if (!attemptId) {
      setError("Missing attempt id.");
      setLoaded(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const detail = await fetchAttempt(studentId, attemptId);
        if (!cancelled) setData(detail);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load attempt"
          );
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  if (!loaded) {
    return <p className={styles.loading}>Loading attempt…</p>;
  }

  if (error || !data) {
    return (
      <div className={styles.empty}>
        <h1>Attempt not found</h1>
        <p>{error ?? "This practice sitting could not be loaded."}</p>
        <Link href="/history" className={styles.primary}>
          Back to history
        </Link>
      </div>
    );
  }

  return (
    <AttemptReview
      title="Past attempt"
      score={data.score}
      practiceBand={data.practiceBand}
      review={data.review}
      emptyReviewMessage="Detailed review wasn’t saved for this older attempt. New tests keep every question here."
      actions={
        <>
          <Link href="/history" className={styles.secondary}>
            All history
          </Link>
          <Link href="/" className={styles.secondary}>
            Home
          </Link>
        </>
      }
    />
  );
}
