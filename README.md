# benjamin-Fe

Next.js frontend for the GED Math practice test. Talks to **benjamin-be** for questions and scoring.

## Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)  
API (required): run benjamin-be on [http://localhost:4000](http://localhost:4000)

## Env

Local (`.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Deploy on Vercel

1. Import the `benjamin-Fe` GitHub repo.
2. Set Environment Variable (Production + Preview):

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | Your Render API URL, e.g. `https://benjamin-be.onrender.com` (no trailing slash) |

3. Redeploy after changing env vars so the value is baked into the client bundle.
4. On Render, set `CORS_ORIGIN` to this Vercel URL (e.g. `https://benjamin-fe.vercel.app`).

## Features

- 46-question Math practice UI with 115-minute timer
- Previous / Next navigation (no question grid)
- Calculator disabled on questions 1–5
- Results and review after submit
