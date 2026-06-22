import { ImportRow, WorkoutSession, WorkoutType } from "./types";

const VALID_TYPES = new Set<WorkoutType>(["push", "pull", "legs"]);

function isValidRow(row: unknown): row is ImportRow {
  if (typeof row !== "object" || row === null) return false;
  const r = row as Record<string, unknown>;
  return (
    typeof r.date === "string" &&
    r.date.length > 0 &&
    typeof r.exercise === "string" &&
    r.exercise.length > 0 &&
    typeof r.weight === "number" &&
    typeof r.reps === "number" &&
    typeof r.sets === "number" &&
    VALID_TYPES.has(r.workoutType as WorkoutType)
  );
}

function dayKey(date: string): string {
  return date.slice(0, 10);
}

function sessionId(date: string, type: WorkoutType): string {
  return `import_${dayKey(date)}_${type}`;
}

export function parseImportData(raw: unknown): { sessions: WorkoutSession[]; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(raw)) {
    return { sessions: [], errors: ["File must contain a JSON array of workout records."] };
  }

  const validRows: ImportRow[] = [];
  raw.forEach((row, i) => {
    if (isValidRow(row)) {
      validRows.push(row);
    } else {
      errors.push(`Row ${i + 1}: invalid or missing fields (date, exercise, weight, reps, sets, workoutType).`);
    }
  });

  // Group by date-day + workoutType
  const groups = new Map<string, { date: string; type: WorkoutType; rows: ImportRow[] }>();
  for (const row of validRows) {
    const key = `${dayKey(row.date)}_${row.workoutType}`;
    if (!groups.has(key)) {
      groups.set(key, { date: row.date, type: row.workoutType, rows: [] });
    }
    groups.get(key)!.rows.push(row);
  }

  const sessions: WorkoutSession[] = Array.from(groups.values()).map(({ date, type, rows }) => ({
    id: sessionId(date, type),
    type,
    date: new Date(date).toISOString(),
    exercises: rows.map((r) => ({
      name: r.exercise,
      weight: String(r.weight),
      reps: String(r.reps),
      sets: String(r.sets),
    })),
  }));

  sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { sessions, errors };
}
