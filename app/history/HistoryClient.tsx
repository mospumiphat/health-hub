"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessions } from "@/lib/storage";
import { WorkoutSession, WORKOUT_META, WorkoutType } from "@/lib/types";

const typeBadge: Record<WorkoutType, string> = {
  push: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  pull: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  legs: "bg-green-500/20 text-green-400 border-green-500/30",
};

const typeBar: Record<WorkoutType, string> = {
  push: "bg-orange-500",
  pull: "bg-blue-500",
  legs: "bg-green-500",
};

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

  return (
    <div className="bg-zinc-900 rounded-2xl overflow-hidden relative">
      {/* Left color bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${typeBar[session.type]}`} />

      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full pl-5 pr-4 py-4 flex items-center justify-between active:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{meta.emoji}</span>
          <div className="text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm">{meta.title}</p>
              <span className={`text-xs border px-2 py-0.5 rounded-full font-medium ${typeBadge[session.type]}`}>
                {session.exercises.length} exercises
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              {formatDate(session.date)}
              {formatDate(session.date) !== "Today" && formatDate(session.date) !== "Yesterday" && (
                <span> · {formatTime(session.date)}</span>
              )}
            </p>
          </div>
        </div>
        <span className={`text-zinc-500 text-xs transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {expanded && (
        <div className="border-t border-zinc-800 pl-5 pr-4 py-3 flex flex-col gap-2.5">
          {session.exercises.map((ex) => {
            const hasData = ex.weight || ex.reps || ex.sets;
            return (
              <div key={ex.name} className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">{ex.name}</span>
                <span className="text-xs text-zinc-500 font-mono">
                  {hasData
                    ? [ex.weight && `${ex.weight}kg`, ex.sets && ex.reps && `${ex.sets}×${ex.reps}`]
                        .filter(Boolean)
                        .join("  ") || "—"
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
    const key = new Date(s.date).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });
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
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col pb-10">
      {/* Header */}
      <div className="px-4 pt-12 pb-5 flex items-center gap-3">
        <Link href="/" className="text-zinc-400 text-sm active:text-white">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">History</h1>
        {sessions.length > 0 && (
          <span className="ml-auto text-xs text-zinc-500 bg-zinc-800 px-2.5 py-1 rounded-full">
            {sessions.length} sessions
          </span>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-3 mt-24 px-8 text-center">
          <span className="text-5xl">💪</span>
          <p className="text-base font-medium text-zinc-400">No workouts logged yet</p>
          <p className="text-sm text-zinc-600">Complete your first session to see it here.</p>
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-6">
          {groups.map(({ label, items }) => (
            <div key={label}>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3 font-semibold">
                {label}
              </p>
              <div className="flex flex-col gap-2.5">
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
