import { WorkoutSession, WorkoutType, WorkoutExercise } from "./types";

const STORAGE_KEY = "workout_sessions";

export function getSessions(): WorkoutSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSession(session: WorkoutSession): void {
  const sessions = getSessions();
  sessions.unshift(session);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function mergeSessions(incoming: WorkoutSession[]): { added: number; skipped: number } {
  const existing = getSessions();
  const existingIds = new Set(existing.map((s) => s.id));

  const toAdd = incoming.filter((s) => !existingIds.has(s.id));
  const merged = [...toAdd, ...existing].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return { added: toAdd.length, skipped: incoming.length - toAdd.length };
}

export function getLastSession(type: WorkoutType): WorkoutSession | null {
  const sessions = getSessions();
  return sessions.find((s) => s.type === type) ?? null;
}

export function getLastValues(
  type: WorkoutType,
  exerciseName: string
): Pick<WorkoutExercise, "weight" | "reps" | "sets"> | null {
  const last = getLastSession(type);
  if (!last) return null;
  const ex = last.exercises.find((e) => e.name === exerciseName);
  return ex ? { weight: ex.weight, reps: ex.reps, sets: ex.sets } : null;
}

export function getAllLastValues(
  type: WorkoutType
): Record<string, Pick<WorkoutExercise, "weight" | "reps" | "sets">> {
  const last = getLastSession(type);
  if (!last) return {};
  return Object.fromEntries(
    last.exercises.map((ex) => [ex.name, { weight: ex.weight, reps: ex.reps, sets: ex.sets }])
  );
}
