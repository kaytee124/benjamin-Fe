"use client";

import styles from "./CalcBanner.module.css";

interface CalcBannerProps {
  allowed: boolean;
}

export function CalcBanner({ allowed }: CalcBannerProps) {
  return (
    <div
      className={`${styles.banner} ${allowed ? styles.allowed : styles.blocked}`}
      role="status"
    >
      {allowed ? (
        <>
          <strong>Calculator Allowed</strong>
          <span>You may use the on-screen calculator for this question.</span>
        </>
      ) : (
        <>
          <strong>No Calculator</strong>
          <span>
            Calculator is disabled for questions 1–5. You can still move freely
            among all questions.
          </span>
        </>
      )}
    </div>
  );
}
