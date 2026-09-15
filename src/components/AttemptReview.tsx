import type { ReactNode } from "react";
import type { PracticeBand, QuestionReview } from "@/lib/types";
import styles from "@/app/test/math/results/results.module.css";

interface AttemptReviewProps {
  title?: string;
  score: {
    correct: number;
    total: number;
    percentage: number;
  };
  practiceBand: string | PracticeBand;
  review: QuestionReview[];
  /** When review is empty (legacy attempts). */
  emptyReviewMessage?: string;
  actions?: ReactNode;
}

export function AttemptReview({
  title = "Your results",
  score,
  practiceBand,
  review,
  emptyReviewMessage,
  actions,
}: AttemptReviewProps) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Mathematical Reasoning</p>
        <h1>{title}</h1>
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

      {actions ? <div className={styles.actions}>{actions}</div> : null}

      <section className={styles.review} aria-labelledby="review-heading">
        <h2 id="review-heading">Question review</h2>
        {review.length === 0 ? (
          <p className={styles.disclaimer}>
            {emptyReviewMessage ??
              "Detailed review wasn’t saved for this older attempt."}
          </p>
        ) : (
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
        )}
      </section>
    </div>
  );
}
