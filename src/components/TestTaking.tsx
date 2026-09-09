"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalcBanner } from "@/components/CalcBanner";
import { Calculator } from "@/components/Calculator";
import { QuestionPanel } from "@/components/QuestionPanel";
import { Timer } from "@/components/Timer";
import { getApiBase } from "@/lib/api";
import { MATH_SUBJECT } from "@/lib/constants";
import {
  clearAttempt,
  loadAttempt,
  remainingMs,
  saveAttempt,
  saveResults,
  type AttemptState,
} from "@/lib/storage";
import type { PublicQuestion, SubmitResponse } from "@/lib/types";
import styles from "./TestTaking.module.css";

export function TestTaking() {
  const router = useRouter();
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [startedAt, setStartedAt] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [remaining, setRemaining] = useState(
    MATH_SUBJECT.timeLimitMinutes * 60 * 1000
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${getApiBase()}/api/subjects/math/questions`
        );
        if (!res.ok) throw new Error("Could not load questions from API.");
        const data = (await res.json()) as { questions: PublicQuestion[] };
        if (cancelled) return;
        setQuestions(data.questions ?? []);
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e instanceof Error
              ? e.message
              : "Failed to reach the practice API. Is benjamin-be running?"
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (questions.length === 0) return;

    const existing = loadAttempt();
    if (existing?.startedAt) {
      const left = remainingMs(
        existing.startedAt,
        MATH_SUBJECT.timeLimitMinutes
      );
      setStartedAt(existing.startedAt);
      setAnswers(existing.answers ?? {});
      setFlagged(existing.flagged ?? []);
      setCurrentIndex(
        Math.min(existing.currentIndex ?? 0, questions.length - 1)
      );
      setRemaining(Math.max(0, left));
    } else {
      const now = new Date().toISOString();
      const initial: AttemptState = {
        startedAt: now,
        answers: {},
        flagged: [],
        currentIndex: 0,
      };
      saveAttempt(initial);
      setStartedAt(now);
    }
    setReady(true);
  }, [questions]);

  useEffect(() => {
    if (!ready || !startedAt) return;
    saveAttempt({
      startedAt,
      answers,
      flagged,
      currentIndex,
    });
  }, [ready, startedAt, answers, flagged, currentIndex]);

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current || questions.length === 0) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);

    const payload = {
      startedAt,
      submittedAt: new Date().toISOString(),
      answers: questions.map((q) => ({
        questionId: q.id,
        studentAnswer: answers[q.id] ?? "",
      })),
    };

    try {
      const res = await fetch(`${getApiBase()}/api/subjects/math/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Scoring failed. Please try again.");
      }
      const data = (await res.json()) as SubmitResponse;
      saveResults(data);
      clearAttempt();
      router.push("/test/math/results");
    } catch (e) {
      submittingRef.current = false;
      setSubmitting(false);
      setError(e instanceof Error ? e.message : "Submission failed");
    }
  }, [answers, questions, router, startedAt]);

  useEffect(() => {
    if (!ready || !startedAt) return;

    const tick = () => {
      const left = remainingMs(startedAt, MATH_SUBJECT.timeLimitMinutes);
      setRemaining(left);
      if (left <= 0 && !submittingRef.current) {
        void handleSubmit();
      }
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [ready, startedAt, handleSubmit]);

  if (loadError) {
    return (
      <p className={styles.loading}>
        {loadError}
        <br />
        <span className={styles.hint}>
          Start the API with <code>npm run dev</code> in <code>backend/</code>{" "}
          (port 4000).
        </span>
      </p>
    );
  }

  if (!ready || questions.length === 0) {
    return <p className={styles.loading}>Loading test…</p>;
  }

  const question = questions[currentIndex];
  const calcAllowed =
    question.calculatorAllowed &&
    currentIndex >= MATH_SUBJECT.noCalculatorCount;

  const setAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const toggleFlag = () => {
    setFlagged((prev) =>
      prev.includes(question.id)
        ? prev.filter((id) => id !== question.id)
        : [...prev, question.id]
    );
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div>
          <p className={styles.subject}>{MATH_SUBJECT.name}</p>
          <p className={styles.sub}>
            Practice test · {questions.length} questions
          </p>
        </div>
        <Timer remainingMs={remaining} />
      </header>

      <CalcBanner allowed={calcAllowed} />

      <div className={styles.layout}>
        <main className={styles.main}>
          <QuestionPanel
            question={question}
            index={currentIndex}
            total={questions.length}
            value={answers[question.id] ?? ""}
            flagged={flagged.includes(question.id)}
            onChange={setAnswer}
            onToggleFlag={toggleFlag}
          />

          <div className={styles.controls}>
            <button
              type="button"
              className={styles.secondary}
              disabled={currentIndex === 0 || submitting}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className={styles.secondary}
              disabled={currentIndex >= questions.length - 1 || submitting}
              onClick={() =>
                setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
              }
            >
              Next
            </button>
            <button
              type="button"
              className={styles.primary}
              disabled={submitting}
              onClick={() => {
                const unanswered = questions.filter(
                  (q) => !answers[q.id]?.trim()
                ).length;
                const msg =
                  unanswered > 0
                    ? `You have ${unanswered} unanswered question(s). Submit anyway?`
                    : "Submit your Math practice test? You cannot change answers after submitting.";
                if (window.confirm(msg)) void handleSubmit();
              }}
            >
              {submitting ? "Submitting…" : "Submit test"}
            </button>
          </div>
          {error ? <p className={styles.error}>{error}</p> : null}
        </main>

        <aside className={styles.calcCol}>
          <p className={styles.calcLabel}>On-screen calculator</p>
          <Calculator enabled={calcAllowed} />
        </aside>
      </div>
    </div>
  );
}
