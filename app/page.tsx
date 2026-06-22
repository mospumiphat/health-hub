import Link from "next/link";
import { WORKOUT_META, WorkoutType } from "@/lib/types";

const workoutTypes: WorkoutType[] = ["push", "pull", "legs"];

const cardStyles: Record<WorkoutType, { gradient: string; border: string }> = {
  push: { gradient: "from-orange-600/20 to-orange-900/10", border: "border-orange-500/30" },
  pull: { gradient: "from-blue-600/20 to-blue-900/10", border: "border-blue-500/30" },
  legs: { gradient: "from-green-600/20 to-green-900/10", border: "border-green-500/30" },
};

const accentBar: Record<WorkoutType, string> = {
  push: "bg-orange-500",
  pull: "bg-blue-500",
  legs: "bg-green-500",
};

function getTodayLabel(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function Home() {
  const today = getTodayLabel();

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col">

      {/* Header */}
      <div className="px-4 pt-14 pb-8">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{today}</p>
        <h1 className="text-3xl font-bold tracking-tight">Let&apos;s Train</h1>
        <p className="text-zinc-400 mt-1 text-sm">Choose today&apos;s workout</p>
      </div>

      {/* Workout cards */}
      <div className="flex-1 px-4 flex flex-col gap-3">
        {workoutTypes.map((type) => {
          const meta = WORKOUT_META[type];
          const style = cardStyles[type];
          return (
            <Link key={type} href={`/workout/${type}`} className="block">
              <div
                className={`w-full bg-gradient-to-br ${style.gradient} border ${style.border} rounded-2xl px-5 py-5 flex items-center gap-4 transition-transform active:scale-[0.98] relative overflow-hidden`}
              >
                {/* Left accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBar[type]} rounded-l-2xl`} />

                <span className="text-3xl ml-1">{meta.emoji}</span>
                <div className="flex-1">
                  <p className="text-lg font-bold leading-tight">{meta.title}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{meta.subtitle}</p>
                </div>
                <span className="text-zinc-600 text-lg">›</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom actions */}
      <div className="px-4 pb-10 pt-6">
        <div className="flex gap-3">
          <Link href="/history" className="flex-1">
            <button className="w-full bg-zinc-800 text-zinc-200 rounded-2xl py-4 text-sm font-semibold active:bg-zinc-700 transition-transform active:scale-95 flex items-center justify-center gap-2">
              <span>📋</span>
              <span>History</span>
            </button>
          </Link>
          <Link href="/import" className="flex-1">
            <button className="w-full bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-2xl py-4 text-sm font-semibold active:bg-zinc-800 transition-transform active:scale-95 flex items-center justify-center gap-2">
              <span>📥</span>
              <span>Import</span>
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
