"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessions } from "@/lib/storage";
import { WorkoutSession, WORKOUT_META, TYPE_ACCENT_CLASS, WorkoutType } from "@/lib/types";

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SessionCard({ session }: { session: WorkoutSession }) {
  const [expanded, setExpanded] = useState(false);
  const meta = WORKOUT_META[session.type];
  const accent = TYPE_ACCENT_CLASS[session.type];

  return (
    <div className="border-b border-rule">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full py-4 flex items-start justify-between active:bg-surface transition-colors text-left"
      >
        <div className="flex items-baseline gap-3">
          <span className={`font-mono text-sm font-bold shrink-0 ${accent.text}`}>{meta.numeral}</span>
          <div>
            <p className="font-mono text-sm font-bold tracking-wider text-ink uppercase">{meta.title}</p>
            <p className="font-mono text-xs text-ink-3 mt-0.5">
              {formatDate(session.date)}
              {formatDate(session.date) !== "Today" && formatDate(session.date) !== "Yesterday"
                ? ` · ${formatTime(session.date)}`
                : ""}
              {" · "}{session.exercises.length} entries
            </p>
          </div>
        </div>
        <span className="font-mono text-xs text-ink-3 mt-0.5 ml-3 shrink-0">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div className="pb-4 pl-6 flex flex-col gap-2.5">
          {session.exercises.map((ex) => {
            const hasData = ex.weight || ex.reps || ex.sets;
            return (
              <div key={ex.name} className="flex items-baseline justify-between">
                <span className="font-mono text-xs text-ink-2 uppercase tracking-wider">{ex.name}</span>
                <span className="font-mono text-xs text-ink-3 ml-4 shrink-0">
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

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  const groups = groupByMonth(sessions);

  return (
    <main className="min-h-screen bg-paper flex flex-col pb-10">

      {/* Header */}
      <div className="px-6 pt-12 pb-5 border-b-2 border-ink flex items-baseline justify-between">
        <div>
          <Link href="/" className="font-mono text-xs text-ink-3 uppercase tracking-widest active:text-ink block mb-3">
            ← Back to Journal
          </Link>
          <h1 className="font-display text-3xl font-bold text-ink">Record Book</h1>
        </div>
        {sessions.length > 0 && (
          <span className="font-mono text-xs text-ink-3 uppercase tracking-wider shrink-0 ml-4">
            {sessions.length} sessions
          </span>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 mt-24 px-8 text-center">
          <p className="font-display text-2xl italic text-ink-3">No entries yet.</p>
          <p className="font-mono text-xs text-ink-3 uppercase tracking-widest">Log your first session to begin.</p>
        </div>
      ) : (
        <div className="px-6 flex flex-col gap-8 pt-6">
          {groups.map(({ label, items }) => (
            <div key={label}>
              <p className="font-mono text-xs text-ink-3 uppercase tracking-widest mb-2 pb-2 border-b border-rule">
                — {label}
              </p>
              <div className="flex flex-col">
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
