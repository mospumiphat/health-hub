"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  WorkoutType,
  WORKOUT_TEMPLATES,
  WORKOUT_META,
  TYPE_ACCENT_CLASS,
  ROMAN,
  WorkoutExercise,
} from "@/lib/types";
import { getAllLastValues, getLastValues, saveSession } from "@/lib/storage";

interface Props {
  type: WorkoutType;
}

type PreviousMap = Record<string, Pick<WorkoutExercise, "weight" | "reps" | "sets"> | null>;

export default function WorkoutClient({ type }: Props) {
  const router = useRouter();
  const exercises = WORKOUT_TEMPLATES[type];
  const meta = WORKOUT_META[type];
  const accent = TYPE_ACCENT_CLASS[type];

  const [data, setData] = useState<WorkoutExercise[]>(
    exercises.map((name) => ({ name, weight: "", reps: "", sets: "" }))
  );
  const [previous, setPrevious] = useState<PreviousMap>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const prevMap: PreviousMap = {};
    exercises.forEach((name) => {
      prevMap[name] = getLastValues(type, name);
    });
    setPrevious(prevMap);
    setData(exercises.map((name) => ({ name, weight: "", reps: "", sets: "" })));
  }, [type]);

  function update(index: number, field: keyof Omit<WorkoutExercise, "name">, value: string) {
    setData((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function step(index: number, field: keyof Omit<WorkoutExercise, "name">, delta: number) {
    setData((prev) => {
      const next = [...prev];
      const current = parseFloat(next[index][field] || "0");
      const result = Math.max(0, current + delta);
      const formatted =
        field === "weight"
          ? result % 1 === 0 ? String(result) : result.toFixed(1)
          : String(Math.round(result));
      next[index] = { ...next[index], [field]: formatted };
      return next;
    });
  }

  function usePrevious(index: number) {
    const name = data[index].name;
    const prev = previous[name];
    if (!prev) return;
    setData((d) => {
      const next = [...d];
      next[index] = { name: next[index].name, weight: prev.weight, reps: prev.reps, sets: prev.sets };
      return next;
    });
  }

  function fillEntireWorkout() {
    const allPrev = getAllLastValues(type);
    setData((d) =>
      d.map((ex) => {
        const prev = allPrev[ex.name];
        if (!prev) return ex;
        return { name: ex.name, weight: prev.weight, reps: prev.reps, sets: prev.sets };
      })
    );
  }

  function handleSave() {
    saveSession({
      id: crypto.randomUUID(),
      type,
      date: new Date().toISOString(),
      exercises: data,
    });
    setSaved(true);
    setTimeout(() => router.push("/"), 800);
  }

  const hasPrevious = Object.values(previous).some((v) => v !== null);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-paper flex flex-col pb-32">

      {/* Header */}
      <div className="px-6 pt-12 pb-5 border-b-2 border-ink relative">
        <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${accent.bg}`} />
        <button
          onClick={() => router.back()}
          className="font-mono text-xs text-ink-3 uppercase tracking-widest mb-4 block active:text-ink"
        >
          ← Back to Journal
        </button>
        <p className="font-mono text-xs text-ink-3 uppercase tracking-widest mb-1">{today}</p>
        <h1 className="font-display text-3xl font-bold text-ink leading-tight">{meta.title}</h1>
        <p className="font-mono text-xs text-ink-3 mt-1">{meta.subtitle}</p>
      </div>

      {/* Carry over button */}
      {hasPrevious && (
        <div className="px-6 pt-5 pb-2">
          <button
            onClick={fillEntireWorkout}
            className="w-full border border-rule text-ink-2 font-mono text-xs font-bold tracking-widest uppercase py-3.5 active:bg-surface transition-colors"
          >
            ↩ Carry Over From Last Session
          </button>
        </div>
      )}

      {/* Exercise entries */}
      <div className="px-6 pt-2 flex flex-col">
        {data.map((ex, i) => {
          const prev = previous[ex.name];
          return (
            <div key={ex.name} className="border-b border-rule py-5">

              {/* Exercise label */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-baseline gap-3">
                  <span className={`font-mono text-sm font-bold ${accent.text}`}>{ROMAN[i]}</span>
                  <h2 className="font-mono text-sm font-bold tracking-wider text-ink uppercase">{ex.name}</h2>
                </div>
                {prev && (
                  <button
                    onClick={() => usePrevious(i)}
                    className={`font-mono text-xs font-bold tracking-wider uppercase ${accent.text} active:opacity-60 shrink-0 ml-3`}
                  >
                    ↩ Carry Over
                  </button>
                )}
              </div>

              {/* Previous entry */}
              {prev ? (
                <p className="font-mono text-xs text-ink-3 mb-4 ml-7">
                  prev — {prev.weight}kg · {prev.reps} reps · {prev.sets} sets
                </p>
              ) : (
                <p className="font-mono text-xs text-ink-3 mb-4 ml-7">no previous entry</p>
              )}

              {/* Weight */}
              <div className="mb-3">
                <label className="font-mono text-xs text-ink-3 uppercase tracking-widest mb-2 block">
                  Load (kg)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => step(i, "weight", -2.5)}
                    className="w-12 h-12 border border-rule bg-surface text-ink-2 text-xl font-light active:bg-surface-dark flex items-center justify-center shrink-0 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="—"
                    value={ex.weight}
                    onChange={(e) => update(i, "weight", e.target.value)}
                    className="flex-1 bg-surface border border-rule text-ink font-mono text-xl font-bold text-center h-12 focus:outline-none focus:border-ink-2"
                  />
                  <button
                    onClick={() => step(i, "weight", 2.5)}
                    className="w-12 h-12 border border-rule bg-surface text-ink-2 text-xl font-light active:bg-surface-dark flex items-center justify-center shrink-0 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Reps + Sets */}
              <div className="grid grid-cols-2 gap-3">
                {(["reps", "sets"] as const).map((field) => (
                  <div key={field}>
                    <label className="font-mono text-xs text-ink-3 uppercase tracking-widest mb-2 block">
                      {field}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => step(i, field, -1)}
                        className="w-10 h-10 border border-rule bg-surface text-ink-2 text-lg font-light active:bg-surface-dark flex items-center justify-center shrink-0 transition-colors"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="—"
                        value={ex[field]}
                        onChange={(e) => update(i, field, e.target.value)}
                        className="flex-1 min-w-0 bg-surface border border-rule text-ink font-mono text-base font-bold text-center h-10 focus:outline-none focus:border-ink-2"
                      />
                      <button
                        onClick={() => step(i, field, 1)}
                        className="w-10 h-10 border border-rule bg-surface text-ink-2 text-lg font-light active:bg-surface-dark flex items-center justify-center shrink-0 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Log session */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-paper border-t-2 border-ink">
        <button
          onClick={handleSave}
          disabled={saved}
          className={`w-full font-mono text-sm font-bold tracking-widest uppercase py-4 transition-colors ${
            saved ? `${accent.bg} text-paper` : "bg-ink text-paper active:bg-ink-2"
          }`}
        >
          {saved ? "✓  Session Logged" : "Log Session"}
        </button>
      </div>
    </main>
  );
}
