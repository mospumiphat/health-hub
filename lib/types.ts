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

export const WORKOUT_META: Record<WorkoutType, { numeral: string; title: string; subtitle: string; icon: string }> = {
  push: { numeral: "I",   title: "CHEST & SHOULDERS", subtitle: "Chest · Shoulders · Triceps", icon: "🏋️" },
  pull: { numeral: "II",  title: "BACK & ARMS",        subtitle: "Back · Biceps · Rear Delts",  icon: "🔥"  },
  legs: { numeral: "III", title: "LEGS & CORE",        subtitle: "Legs · Glutes · Core",        icon: "🦵"  },
};

export const WORKOUT_LABELS: Record<WorkoutType, string> = {
  push: "CHEST & SHOULDERS",
  pull: "BACK & ARMS",
  legs: "LEGS & CORE",
};

export const TYPE_ACCENT_CLASS: Record<WorkoutType, { text: string; border: string; bg: string }> = {
  push: { text: "text-amber",   border: "border-amber",   bg: "bg-amber"   },
  pull: { text: "text-forest",  border: "border-forest",  bg: "bg-forest"  },
  legs: { text: "text-sienna",  border: "border-sienna",  bg: "bg-sienna"  },
};

export const ROMAN = ["I", "II", "III", "IV", "V"];
