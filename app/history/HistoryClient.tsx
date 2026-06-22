"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessions } from "@/lib/storage";
import { WorkoutSession, WORKOUT_META, TYPE_ACCENT_CLASS } from "@/lib/types";

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function SessionCard({ session }: { session: WorkoutSession }) {
  const [expanded, setExpanded] = useState(false);
  const meta = WORKOUT_META[session.type];
  const accent = TYPE_ACCENT_CLASS[session.type];
  const dateLabel = formatDate(session.date);

  return (
    <div className={`bg-surface rounded-2xl border-l-[3px] ${accent.border} overflow-hidden`}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-5 py-4 flex items-center justify-between active:bg-surface-dark transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl shrink-0">{meta.icon}</span>
          <div>
            <p className={`font-mono text-sm font-bold tracking-wide ${accent.text}`}>{meta.title}</p>
            <p className="text-xs text-ink-3 mt-0.5">
              {dateLabel}
              {dateLabel !== "Today" && dateLabel !== "Yesterday" ? ` · ${formatTime(session.date)}` : ""}
              {" · "}{session.exercises.length} entries
            </p>
          </div>
        </div>
        <span className="text-ink-3 text-xs ml-3 shrink-0">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-5 pb-4 pt-1 border-t border-rule flex flex-col gap-2">
          {session.exercises.map((ex) => {
            const hasData = ex.weight || ex.reps || ex.sets;
            return (
              <div key={ex.name} className="flex items-baseline justify-between">
                <span className="text-xs text-ink-2 font-mono uppercase tracking-wider">{ex.name}</span>
                <span className="text-xs text-ink-3 font-mono ml-4 shrink-0">
                  {hasData
                    ? [ex.weight && `${ex.weight}kg`, ex.sets && ex.reps && `${ex.sets}×${ex.reps}`]
                        .filter(Boolean).join("  ") || "—"
                    : "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function groupByMonth(sessions: WorkoutSession[]): { label: string; items: WorkoutSession[] }[] {
  const groups: Record<string, WorkoutSession[]> = {};
  for (const s of sessions) {
    const key = new Date(s.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  }
  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

export default function HistoryClient() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setSessions(await getSessions());
      setLoading(false);
    }
    load();
  }, []);

  const groups = groupByMonth(sessions);

  return (
    <main className="min-h-screen bg-paper flex flex-col pb-10">
      <div className="px-5 pt-12 pb-6 flex items-center justify-between">
        <div>
          <Link href="/" className="text-xs font-mono text-ink-3 uppercase tracking-widest active:text-ink block mb-4">
            ← Back
          </Link>
          <h1 className="font-display text-3xl font-bold text-ink">Record Book</h1>
        </div>
        {!loading && sessions.length > 0 && (
          <span className="font-mono text-xs text-ink-3 uppercase tracking-wider shrink-0 ml-4 self-end pb-0.5">
            {sessions.length} sessions
          </span>
        )}
      </div>

      {loading ? (
        <div className="px-5 flex flex-col gap-2">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="bg-surface rounded-2xl h-16 animate-pulse" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8 text-center">
          <p className="font-display text-2xl italic text-ink-3">No entries yet.</p>
          <p className="text-xs font-mono text-ink-3 uppercase tracking-widest">Log your first session to begin.</p>
        </div>
      ) : (
        <div className="px-5 flex flex-col gap-6">
          {groups.map(({ label, items }) => (
            <div key={label}>
              <p className="font-mono text-xs text-ink-3 uppercase tracking-widest mb-3">— {label}</p>
              <div className="flex flex-col gap-2">
                {items.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
