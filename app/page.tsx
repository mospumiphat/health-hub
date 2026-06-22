import Link from "next/link";
import { WORKOUT_META, TYPE_ACCENT_CLASS, WorkoutType } from "@/lib/types";

const workoutTypes: WorkoutType[] = ["push", "pull", "legs"];

function getDayLabel(): { day: string; date: string } {
  const now = new Date();
  return {
    day: now.toLocaleDateString("en-GB", { weekday: "long" }).toUpperCase(),
    date: now.toLocaleDateString("en-GB", { day: "numeric", month: "long" }).toUpperCase(),
  };
}

export default function Home() {
  const { day, date } = getDayLabel();

  return (
    <main className="min-h-screen bg-paper flex flex-col">

      {/* Header */}
      <div className="px-5 pt-14 pb-8">
        <p className="text-xs font-mono text-ink-3 uppercase tracking-widest mb-3">
          {day} · {date}
        </p>
        <h1 className="font-display text-4xl font-bold text-ink leading-tight">Let's Train</h1>
        <p className="text-sm text-ink-3 mt-2">Choose today's workout</p>
      </div>

      {/* Workout cards */}
      <div className="px-5 flex-1 flex flex-col gap-3">
        {workoutTypes.map((type) => {
          const meta = WORKOUT_META[type];
          const accent = TYPE_ACCENT_CLASS[type];
          return (
            <Link key={type} href={`/workout/${type}`} className="block">
              <div className={`bg-surface rounded-2xl px-5 py-5 flex items-center gap-4 border-l-[3px] ${accent.border} active:bg-surface-dark transition-colors`}>
                <span className="text-2xl shrink-0">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-mono text-sm font-bold tracking-wider ${accent.text}`}>{meta.title}</p>
                  <p className="text-xs text-ink-3 mt-1">{meta.subtitle}</p>
                </div>
                <span className="text-ink-3 text-xl shrink-0">›</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 pb-12 pt-6 flex gap-3">
        <Link href="/history" className="flex-1">
          <button className="w-full bg-surface rounded-2xl text-ink font-mono text-xs font-bold tracking-widest uppercase py-4 active:bg-surface-dark transition-colors">
            History
          </button>
        </Link>
        <Link href="/import" className="flex-1">
          <button className="w-full bg-surface rounded-2xl text-ink-2 font-mono text-xs font-bold tracking-widest uppercase py-4 active:bg-surface-dark transition-colors">
            Import
          </button>
        </Link>
      </div>
    </main>
  );
}
