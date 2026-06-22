"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  WorkoutType,
  WORKOUT_TEMPLATES,
  WORKOUT_META,
  WorkoutExercise,
} from "@/lib/types";
import { getAllLastValues, getLastValues, saveSession } from "@/lib/storage";

interface Props {
  type: WorkoutType;
}

type PreviousMap = Record<string, Pick<WorkoutExercise, "weight" | "reps" | "sets"> | null>;

const accentColors: Record<WorkoutType, string> = {
  push: "from-orange-500 to-orange-700",
  pull: "from-blue-500 to-blue-700",
  legs: "from-green-500 to-green-700",
};

const ringColors: Record<WorkoutType, string> = {
  push: "focus:ring-orange-500",
  pull: "focus:ring-blue-500",
  legs: "focus:ring-green-500",
};

export default function WorkoutClient({ type }: Props) {
  const router = useRouter();
  const exercises = WORKOUT_TEMPLATES[type];
  const meta = WORKOUT_META[type];

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
          ? result % 1 === 0
            ? String(result)
            : result.toFixed(1)
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
  const ring = ringColors[type];

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col pb-32">

      {/* Header */}
      <div className={`bg-gradient-to-r ${accentColors[type]} px-4 pt-12 pb-5`}>
        <button
          onClick={() => router.back()}
          className="text-white/60 text-sm mb-3 active:text-white block"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{meta.emoji}</span>
          <div>
            <h1 className="text-2xl font-bold leading-tight">{meta.title}</h1>
            <p className="text-sm text-white/60 mt-0.5">{meta.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Fill Entire Workout */}
      {hasPrevious && (
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={fillEntireWorkout}
            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm font-semibold rounded-2xl py-3.5 active:bg-zinc-700 transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <span>⚡</span>
            <span>Fill Entire Workout from Last Session</span>
          </button>
        </div>
      )}

      {/* Exercises */}
      <div className="px-4 pt-3 flex flex-col gap-4">
        {data.map((ex, i) => {
          const prev = previous[ex.name];
          return (
            <div key={ex.name} className="bg-zinc-900 rounded-2xl overflow-hidden">
              {/* Exercise header */}
              <div className="px-4 pt-4 pb-3 flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold">{ex.name}</h2>
                  {prev ? (
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Last: {prev.weight}kg · {prev.reps} reps · {prev.sets} sets
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-600 mt-0.5">No previous data</p>
                  )}
                </div>
                {prev && (
                  <button
                    onClick={() => usePrevious(i)}
                    className="shrink-0 ml-2 mt-0.5 bg-zinc-700 text-zinc-200 text-xs font-medium px-3 py-1.5 rounded-full active:bg-zinc-600 transition-colors"
                  >
                    ↩ Use Last
                  </button>
                )}
              </div>

              <div className="px-4 pb-4 flex flex-col gap-3">
                {/* Weight — full width with big steppers */}
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5 block">
                    Weight (kg)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => step(i, "weight", -2.5)}
                      className="w-12 h-12 bg-zinc-800 rounded-xl text-xl font-light text-zinc-300 active:bg-zinc-700 active:text-white flex items-center justify-center shrink-0"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="0"
                      value={ex.weight}
                      onChange={(e) => update(i, "weight", e.target.value)}
                      className={`flex-1 bg-zinc-800 text-white rounded-xl h-12 text-lg font-bold text-center focus:outline-none focus:ring-2 ${ring}`}
                    />
                    <button
                      onClick={() => step(i, "weight", 2.5)}
                      className="w-12 h-12 bg-zinc-800 rounded-xl text-xl font-light text-zinc-300 active:bg-zinc-700 active:text-white flex items-center justify-center shrink-0"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Reps + Sets side by side */}
                <div className="grid grid-cols-2 gap-3">
                  {(["reps", "sets"] as const).map((field) => (
                    <div key={field}>
                      <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5 block">
                        {field}
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => step(i, field, -1)}
                          className="w-10 h-10 bg-zinc-800 rounded-xl text-lg font-light text-zinc-300 active:bg-zinc-700 active:text-white flex items-center justify-center shrink-0"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          inputMode="numeric"
                          placeholder="0"
                          value={ex[field]}
                          onChange={(e) => update(i, field, e.target.value)}
                          className={`flex-1 min-w-0 bg-zinc-800 text-white rounded-xl h-10 text-base font-bold text-center focus:outline-none focus:ring-2 ${ring}`}
                        />
                        <button
                          onClick={() => step(i, field, 1)}
                          className="w-10 h-10 bg-zinc-800 rounded-xl text-lg font-light text-zinc-300 active:bg-zinc-700 active:text-white flex items-center justify-center shrink-0"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-zinc-950/95 backdrop-blur-sm border-t border-zinc-900">
        <button
          onClick={handleSave}
          disabled={saved}
          className={`w-full text-white text-lg font-bold rounded-2xl py-4 transition-all active:scale-95 ${
            saved
              ? "bg-green-600"
              : `bg-gradient-to-r ${accentColors[type]} active:opacity-90`
          }`}
        >
          {saved ? "✓  Saved!" : "Save Workout"}
        </button>
      </div>
    </main>
  );
}
