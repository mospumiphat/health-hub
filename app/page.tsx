import Link from "next/link";
import { WORKOUT_META, TYPE_ACCENT_CLASS, WorkoutType } from "@/lib/types";

const workoutTypes: WorkoutType[] = ["push", "pull", "legs"];

function getTodayLabel(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Home() {
  const today = getTodayLabel();

  return (
    <main className="min-h-screen bg-paper flex flex-col">

      {/* Masthead */}
      <div className="px-6 pt-14 pb-7 border-b-2 border-ink">
        <p className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.3em] mb-3">{today}</p>
        <h1 className="font-display text-5xl font-bold text-ink leading-none">Training</h1>
        <h1 className="font-display text-5xl font-bold italic text-ink leading-none">Journal</h1>
        <p className="font-mono text-[10px] text-ink-3 tracking-[0.2em] uppercase mt-3">Personal Record Book</p>
      </div>

      {/* Program list */}
      <div className="flex-1 flex flex-col">
        {workoutTypes.map((type) => {
          const meta = WORKOUT_META[type];
          const accent = TYPE_ACCENT_CLASS[type];
          return (
            <Link key={type} href={`/workout/${type}`} className="block">
              <div className="px-6 py-5 border-b border-rule flex items-center gap-5 active:bg-surface transition-colors relative">
                <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${accent.bg}`} />
                <span className="font-mono text-xs text-ink-3 w-7 shrink-0 pl-1">{meta.numeral}</span>
                <div className="flex-1 pl-1">
                  <p className="font-mono text-xs font-bold tracking-[0.15em] text-ink uppercase">{meta.title}</p>
                  <p className="font-mono text-[10px] text-ink-3 mt-1 tracking-wider">{meta.subtitle}</p>
                </div>
                <span className={`font-mono text-base ${accent.text}`}>→</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer actions */}
      <div className="px-6 pb-12 pt-6 border-t-2 border-ink flex gap-3">
        <Link href="/history" className="flex-1">
          <button className="w-full bg-ink text-paper font-mono text-[10px] font-bold tracking-[0.25em] uppercase py-4 active:bg-ink-2 transition-colors">
            Record Book
          </button>
        </Link>
        <Link href="/import" className="flex-1">
          <button className="w-full border border-rule text-ink-3 font-mono text-[10px] font-bold tracking-[0.25em] uppercase py-4 active:bg-surface transition-colors">
            Import Data
          </button>
        </Link>
      </div>
    </main>
  );
}
