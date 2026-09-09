# benjamin-Fe

Next.js frontend for the GED Math practice test. Talks to **benjamin-be** for questions and scoring.

## Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)  
API: hardcoded to [https://benjamin-be-2.onrender.com](https://benjamin-be-2.onrender.com) in `src/lib/api.ts`.

## Env

No env required for the API URL right now (hardcoded). On Render, set `CORS_ORIGIN` to your Vercel/local frontend origin so the browser can call the API.

### Deploy on Vercel

1. Import the `benjamin-Fe` GitHub repo.
2. Redeploy after pulling the hardcoded API base.
3. On Render, set `CORS_ORIGIN` to this Vercel URL (e.g. `https://benjamin-fe.vercel.app`).
## Features

- 46-question Math practice UI with 115-minute timer
- Previous / Next navigation (no question grid)
- Calculator disabled on questions 1–5
- Results and review after submit
