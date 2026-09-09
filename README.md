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

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Features

- 46-question Math practice UI with 115-minute timer
- Previous / Next navigation (no question grid)
- Calculator disabled on questions 1–5
- Results and review after submit
