"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  WorkoutType,
  WORKOUT_TEMPLATES,
  WORKOUT_META,
  TYPE_ACCENT_CLASS,
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

  return (
    <main className="min-h-screen bg-paper flex flex-col pb-32">

      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <button
          onClick={() => router.back()}
          className="text-xs font-mono text-ink-3 uppercase tracking-widest mb-5 block active:text-ink"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">{meta.icon}</span>
          <h1 className="font-display text-3xl font-bold text-ink leading-tight">{meta.title}</h1>
        </div>
        <p className="text-sm text-ink-3 mt-1 ml-12">{meta.subtitle}</p>
      </div>

      {/* Carry over */}
      {hasPrevious && (
        <div className="px-5 pb-3">
          <button
            onClick={fillEntireWorkout}
            className={`w-full bg-surface rounded-2xl text-ink-2 font-mono text-xs font-bold tracking-widest uppercase py-3.5 active:bg-surface-dark transition-colors border-l-[3px] ${accent.border}`}
          >
            ↩ Carry Over From Last Session
          </button>
        </div>
      )}

      {/* Exercise cards */}
      <div className="px-5 flex flex-col gap-3">
        {data.map((ex, i) => {
          const prev = previous[ex.name];
          return (
            <div key={ex.name} className="bg-surface rounded-2xl p-5">

              {/* Exercise label */}
              <div className="flex items-start justify-between mb-1">
                <div>
                  <span className={`font-mono text-xs font-bold ${accent.text} mr-2`}>{i + 1}.</span>
                  <span className="font-mono text-sm font-bold tracking-wide text-ink uppercase">{ex.name}</span>
                </div>
                {prev && (
                  <button
                    onClick={() => usePrevious(i)}
                    className={`font-mono text-xs font-bold tracking-wide ${accent.text} active:opacity-60 shrink-0 ml-3`}
                  >
                    ↩
                  </button>
                )}
              </div>

              {/* Previous */}
              <p className="text-xs text-ink-3 mb-4 ml-5">
                {prev ? `prev — ${prev.weight}kg · ${prev.reps} reps · ${prev.sets} sets` : "no previous entry"}
              </p>

              {/* Weight */}
              <div className="mb-3">
                <label className="text-xs text-ink-3 uppercase tracking-widest mb-2 block font-mono">Load (kg)</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => step(i, "weight", -2.5)}
                    className="w-12 h-12 rounded-xl bg-paper text-ink-2 text-xl font-light active:bg-surface-dark flex items-center justify-center shrink-0 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="—"
                    value={ex.weight}
                    onChange={(e) => update(i, "weight", e.target.value)}
                    className="flex-1 bg-paper rounded-xl text-ink font-mono text-xl font-bold text-center h-12 focus:outline-none focus:ring-1 focus:ring-rule"
                  />
                  <button
                    onClick={() => step(i, "weight", 2.5)}
                    className="w-12 h-12 rounded-xl bg-paper text-ink-2 text-xl font-light active:bg-surface-dark flex items-center justify-center shrink-0 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Reps + Sets */}
              <div className="grid grid-cols-2 gap-3">
                {(["reps", "sets"] as const).map((field) => (
                  <div key={field}>
                    <label className="text-xs text-ink-3 uppercase tracking-widest mb-2 block font-mono">{field}</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => step(i, field, -1)}
                        className="w-10 h-10 rounded-xl bg-paper text-ink-2 text-lg font-light active:bg-surface-dark flex items-center justify-center shrink-0 transition-colors"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="—"
                        value={ex[field]}
                        onChange={(e) => update(i, field, e.target.value)}
                        className="flex-1 min-w-0 bg-paper rounded-xl text-ink font-mono text-base font-bold text-center h-10 focus:outline-none focus:ring-1 focus:ring-rule"
                      />
                      <button
                        onClick={() => step(i, field, 1)}
                        className="w-10 h-10 rounded-xl bg-paper text-ink-2 text-lg font-light active:bg-surface-dark flex items-center justify-center shrink-0 transition-colors"
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
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-paper">
        <button
          onClick={handleSave}
          disabled={saved}
          className={`w-full rounded-2xl font-mono text-sm font-bold tracking-widest uppercase py-4 transition-colors ${
            saved ? `${accent.bg} text-paper` : "bg-ink text-paper active:opacity-80"
          }`}
        >
          {saved ? "✓  Session Logged" : "Log Session"}
        </button>
      </div>
    </main>
  );
}
