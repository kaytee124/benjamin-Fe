"use client";

import { formatTime } from "@/lib/storage";
import styles from "./Timer.module.css";

interface TimerProps {
  remainingMs: number;
}

export function Timer({ remainingMs }: TimerProps) {
  const urgent = remainingMs <= 5 * 60 * 1000;
  return (
    <div
      className={`${styles.timer} ${urgent ? styles.urgent : ""}`}
      aria-live="polite"
      aria-label={`Time remaining ${formatTime(remainingMs)}`}
    >
      <span className={styles.label}>Time left</span>
      <span className={styles.value}>{formatTime(remainingMs)}</span>
    </div>
  );
}
