# Workout Tracker

A personal gym workout tracker built for mobile. Log Push, Pull, and Leg day sessions with autofill from previous workouts — no login, no cloud, just fast logging.

## Features

- **3 workout programs** — Push Day, Pull Day, Leg Day with preset exercises
- **Stepper inputs** — +/− buttons for weight (2.5kg steps), reps, and sets — gym-friendly, no typing needed
- **Autofill** — tap "Use Last" per exercise or "Fill Entire Workout" to load all previous values in one tap
- **History** — expandable session log grouped by month, color-coded by workout type
- **Import** — load historical data from a JSON file, merges with existing history and skips duplicates
- **localStorage only** — all data stays in the browser, no account or backend required

## Tech Stack

- [Next.js 15](https://nextjs.org/) — App Router
- TypeScript
- Tailwind CSS v4
- localStorage for client-side persistence

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Import Format

To load historical workout data, go to **Import** and upload a JSON file in this shape:

```json
[
  {
    "date": "2026-01-15",
    "exercise": "Bench Press",
    "weight": 60,
    "reps": 8,
    "sets": 4,
    "workoutType": "push"
  }
]
```

`workoutType` must be `"push"`, `"pull"`, or `"legs"`. Records on the same date and type are grouped into one session automatically. Duplicates are skipped on re-import.

## Roadmap

- [ ] Progressive overload suggestions
- [ ] Rest timer between sets
- [ ] Bodyweight exercise support (no weight field)
- [ ] Export data to JSON
- [ ] PWA — install to home screen
