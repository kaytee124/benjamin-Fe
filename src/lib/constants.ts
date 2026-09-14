import type { SubjectMeta } from "./types";

export const MATH_SUBJECT: SubjectMeta = {
  id: "math",
  name: "Mathematical Reasoning",
  timeLimitMinutes: 115,
  questionCount: 46,
  noCalculatorCount: 5,
};

export const SUBJECTS: SubjectMeta[] = [MATH_SUBJECT];

export const STORAGE_KEY = "ged-math-attempt-v1";
export const RESULTS_KEY = "ged-math-results-v1";
export const STUDENT_ID_KEY = "ged-math-student-id-v1";
