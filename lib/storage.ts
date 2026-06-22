import { createClient } from "@/utils/supabase/client";
import { WorkoutSession, WorkoutType, WorkoutExercise } from "./types";

export async function getSessions(): Promise<WorkoutSession[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("workout_sessions")
    .select("*")
    .order("date", { ascending: false });

  if (!data) return [];
  return data.map((row) => ({
    id: row.id,
    type: row.type as WorkoutType,
    date: row.date,
    exercises: row.exercises as WorkoutExercise[],
  }));
}

export async function saveSession(session: WorkoutSession): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("workout_sessions").insert({
    id: session.id,
    user_id: user.id,
    type: session.type,
    date: session.date,
    exercises: session.exercises,
  });
}

export async function mergeSessions(
  incoming: WorkoutSession[]
): Promise<{ added: number; skipped: number }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { added: 0, skipped: 0 };

  const { data: existing } = await supabase
    .from("workout_sessions")
    .select("id");

  const existingIds = new Set((existing || []).map((r) => r.id));
  const toInsert = incoming.filter((s) => !existingIds.has(s.id));

  if (toInsert.length > 0) {
    await supabase.from("workout_sessions").insert(
      toInsert.map((s) => ({
        id: s.id,
        user_id: user.id,
        type: s.type,
        date: s.date,
        exercises: s.exercises,
      }))
    );
  }

  return { added: toInsert.length, skipped: incoming.length - toInsert.length };
}

export async function getAllLastValues(
  type: WorkoutType
): Promise<Record<string, Pick<WorkoutExercise, "weight" | "reps" | "sets">>> {
  const supabase = createClient();
  const { data } = await supabase
    .from("workout_sessions")
    .select("exercises")
    .eq("type", type)
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (!data) return {};

  const result: Record<string, Pick<WorkoutExercise, "weight" | "reps" | "sets">> = {};
  for (const ex of data.exercises as WorkoutExercise[]) {
    result[ex.name] = { weight: ex.weight, reps: ex.reps, sets: ex.sets };
  }
  return result;
}

export async function getLastValues(
  type: WorkoutType,
  exerciseName: string
): Promise<Pick<WorkoutExercise, "weight" | "reps" | "sets"> | null> {
  const all = await getAllLastValues(type);
  return all[exerciseName] ?? null;
}
