"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { parseImportData } from "@/lib/importUtils";
import { mergeSessions } from "@/lib/storage";

type Status =
  | { kind: "idle" }
  | { kind: "error"; message: string; rowErrors: string[] }
  | { kind: "success"; added: number; skipped: number };

export default function ImportClient() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [fileName, setFileName] = useState<string>("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setStatus({ kind: "idle" });

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string);
        const { sessions, errors } = parseImportData(raw);
        if (sessions.length === 0) {
          setStatus({ kind: "error", message: "No valid records found.", rowErrors: errors.slice(0, 5) });
          return;
        }
        const { added, skipped } = mergeSessions(sessions);
        setStatus({ kind: "success", added, skipped });
      } catch {
        setStatus({ kind: "error", message: "Invalid JSON file.", rowErrors: [] });
      }
    };
    reader.readAsText(file);
  }

  return (
    <main className="min-h-screen bg-paper flex flex-col pb-10">

      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <Link href="/" className="text-xs font-mono text-ink-3 uppercase tracking-widest active:text-ink block mb-4">
          ← Back
        </Link>
        <h1 className="font-display text-3xl font-bold text-ink">Import Data</h1>
        <p className="text-sm text-ink-3 mt-1">Load historical records from file</p>
      </div>

      <div className="px-5 flex flex-col gap-4">

        {/* Upload zone */}
        <button
          onClick={() => fileRef.current?.click()}
          className={`w-full bg-surface rounded-2xl py-12 flex flex-col items-center gap-3 active:bg-surface-dark transition-colors border-2 border-dashed ${
            status.kind === "success" ? "border-forest" :
            status.kind === "error"   ? "border-amber"  :
                                        "border-rule"
          }`}
        >
          <span className="text-3xl">
            {status.kind === "success" ? "✅" : status.kind === "error" ? "❌" : "📂"}
          </span>
          <p className="font-mono text-xs text-ink-2 uppercase tracking-widest">
            {fileName || "Tap to select JSON file"}
          </p>
        </button>
        <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFile} />

        {/* Success */}
        {status.kind === "success" && (
          <div className="bg-surface rounded-2xl border-l-[3px] border-forest p-5">
            <p className="font-mono text-xs font-bold text-forest uppercase tracking-widest mb-2">Import Complete</p>
            <p className="text-sm text-ink">{status.added} session{status.added !== 1 ? "s" : ""} added</p>
            {status.skipped > 0 && (
              <p className="text-xs text-ink-3 font-mono mt-1">{status.skipped} duplicate{status.skipped !== 1 ? "s" : ""} skipped</p>
            )}
            <Link href="/history">
              <button className="mt-4 w-full bg-ink rounded-2xl text-paper font-mono text-xs font-bold tracking-widest uppercase py-3.5 active:opacity-80 transition-opacity">
                View Record Book →
              </button>
            </Link>
          </div>
        )}

        {/* Error */}
        {status.kind === "error" && (
          <div className="bg-surface rounded-2xl border-l-[3px] border-amber p-5">
            <p className="font-mono text-xs font-bold text-amber uppercase tracking-widest mb-2">Import Failed</p>
            <p className="text-sm text-ink">{status.message}</p>
            {status.rowErrors.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1.5 pt-3 border-t border-rule">
                {status.rowErrors.map((err, i) => (
                  <li key={i} className="font-mono text-xs text-ink-3">{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Format reference */}
        <div className="bg-surface rounded-2xl p-5">
          <p className="font-mono text-xs text-ink-3 uppercase tracking-widest mb-3">Expected Format</p>
          <pre className="font-mono text-xs text-ink-2 leading-relaxed overflow-x-auto bg-paper rounded-xl p-3">{`[
  {
    "date": "2026-01-15",
    "exercise": "Bench Press",
    "weight": 60,
    "reps": 8,
    "sets": 4,
    "workoutType": "push"
  }
]`}</pre>
          <p className="font-mono text-xs text-ink-3 mt-3">
            workoutType: <span className="text-amber">push</span> · <span className="text-forest">pull</span> · <span className="text-sienna">legs</span>
          </p>
        </div>

      </div>
    </main>
  );
}
