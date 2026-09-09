"use client";

import type { PublicQuestion } from "@/lib/types";
import styles from "./QuestionPanel.module.css";

interface QuestionPanelProps {
  question: PublicQuestion;
  index: number;
  total: number;
  value: string;
  flagged: boolean;
  onChange: (value: string) => void;
  onToggleFlag: () => void;
}

export function QuestionPanel({
  question,
  index,
  total,
  value,
  flagged,
  onChange,
  onToggleFlag,
}: QuestionPanelProps) {
  return (
    <section className={styles.panel} aria-labelledby="question-heading">
      <div className={styles.meta}>
        <h2 id="question-heading" className={styles.title}>
          Question {index + 1} of {total}
        </h2>
        <button
          type="button"
          className={`${styles.flagBtn} ${flagged ? styles.flagged : ""}`}
          onClick={onToggleFlag}
        >
          {flagged ? "Flagged for review" : "Flag for review"}
        </button>
      </div>

      <p className={styles.prompt}>{question.prompt}</p>

      {question.type === "multiple_choice" && question.options ? (
        <fieldset className={styles.options}>
          <legend className={styles.srOnly}>Answer choices</legend>
          {question.options.map((opt) => {
            const inputId = `${question.id}-${opt}`;
            return (
              <label key={opt} className={styles.option} htmlFor={inputId}>
                <input
                  id={inputId}
                  type="radio"
                  name={question.id}
                  value={opt}
                  checked={value === opt}
                  onChange={() => onChange(opt)}
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </fieldset>
      ) : (
        <div className={styles.short}>
          <label htmlFor={`${question.id}-sa`} className={styles.saLabel}>
            Your answer
          </label>
          <input
            id={`${question.id}-sa`}
            type="text"
            className={styles.saInput}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      )}
    </section>
  );
}
