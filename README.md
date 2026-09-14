# benjamin-Fe

Next.js frontend for the GED Math practice test. Talks to **benjamin-be** for unique question sessions, scoring, and coach analytics.

## Setup

```bash
npm install
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)  
Coach: [http://localhost:3000/coach](http://localhost:3000/coach)

On **localhost**, the FE calls `http://localhost:4000`.  
On **Vercel**, it calls `https://benjamin-be-2.onrender.com`.

## Test flow

1. Start → `POST /api/subjects/math/sessions` (fresh 46-question form).
2. `sessionId` is saved in localStorage with answers/timer state.
3. Refresh resumes the same session via `GET /sessions/:id`.
4. Submit sends `sessionId` + answers for server-side scoring.

## Coach review

Passcode-gated dashboard at `/coach`. Shows score history and flagged weak topics (statistical rules, no LLM). Requires backend `COACH_PASSCODE` + `DATABASE_URL`.

## Features

- Unique generated question set each attempt (parametric templates, no LLM)
- 115-minute timer, Previous / Next navigation
- Calculator disabled on questions 1–5
- Results review after submit
- Coach topic-weakness dashboard
