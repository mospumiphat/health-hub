export type WorkoutType = "push" | "pull" | "legs";

export interface WorkoutExercise {
  name: string;
  weight: string;
  reps: string;
  sets: string;
}

export interface WorkoutSession {
  id: string;
  type: WorkoutType;
  date: string;
  exercises: WorkoutExercise[];
}

export interface ImportRow {
  date: string;
  exercise: string;
  weight: number;
  reps: number;
  sets: number;
  workoutType: WorkoutType;
}

export const WORKOUT_TEMPLATES: Record<WorkoutType, string[]> = {
  push: [
    "Bench Press",
    "Incline DB Press",
    "Overhead Press",
    "Lateral Raise",
    "Tricep Pushdown",
  ],
  pull: [
    "Lat Pulldown",
    "Seated Row",
    "Deadlift",
    "Face Pull",
    "Bicep Curl",
  ],
  legs: [
    "Squat",
    "Leg Press",
    "Romanian Deadlift",
    "Walking Lunges",
    "Hanging Leg Raise",
  ],
};

export const WORKOUT_META: Record<WorkoutType, { emoji: string; title: string; subtitle: string }> = {
  push: { emoji: "🏋️", title: "Push Day", subtitle: "Chest • Shoulders • Triceps" },
  pull: { emoji: "🔥", title: "Pull Day", subtitle: "Back • Biceps • Rear Delts" },
  legs: { emoji: "🦵", title: "Leg Day", subtitle: "Legs • Glutes • Core" },
};

export const WORKOUT_LABELS: Record<WorkoutType, string> = {
  push: "🏋️ Push Day",
  pull: "🔥 Pull Day",
  legs: "🦵 Leg Day",
};
