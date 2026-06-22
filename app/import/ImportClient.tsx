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
      <div className="px-6 pt-12 pb-5 border-b-2 border-ink">
        <Link href="/" className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.2em] active:text-ink block mb-3">
          ← Back to Journal
        </Link>
        <h1 className="font-display text-3xl font-bold text-ink">Import Data</h1>
        <p className="font-mono text-[10px] text-ink-3 tracking-wider mt-1 uppercase">Load historical records from file</p>
      </div>

      <div className="px-6 pt-6 flex flex-col gap-6">

        {/* Upload zone */}
        <button
          onClick={() => fileRef.current?.click()}
          className={`w-full border-2 border-dashed py-12 flex flex-col items-center gap-3 transition-colors active:bg-surface ${
            status.kind === "success" ? "border-forest" :
            status.kind === "error"   ? "border-amber"  :
                                        "border-rule"
          }`}
        >
          <span className="font-display text-4xl italic text-ink-3">
            {status.kind === "success" ? "✓" : status.kind === "error" ? "✕" : "↑"}
          </span>
          <p className="font-mono text-[10px] text-ink-2 uppercase tracking-[0.2em]">
            {fileName || "Tap to select JSON file"}
          </p>
          {fileName && status.kind === "idle" && (
            <p className="font-mono text-[9px] text-ink-3">{fileName}</p>
          )}
        </button>
        <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFile} />

        {/* Success */}
        {status.kind === "success" && (
          <div className="border border-forest p-4">
            <p className="font-mono text-[10px] font-bold text-forest uppercase tracking-[0.2em] mb-2">Import Complete</p>
            <p className="font-mono text-xs text-ink-2">{status.added} session{status.added !== 1 ? "s" : ""} added</p>
            {status.skipped > 0 && (
              <p className="font-mono text-[10px] text-ink-3 mt-1">{status.skipped} duplicate{status.skipped !== 1 ? "s" : ""} skipped</p>
            )}
            <Link href="/history">
              <button className="mt-4 w-full bg-ink text-paper font-mono text-[10px] font-bold tracking-[0.25em] uppercase py-3 active:bg-ink-2 transition-colors">
                View Record Book →
              </button>
            </Link>
          </div>
        )}

        {/* Error */}
        {status.kind === "error" && (
          <div className="border border-amber p-4">
            <p className="font-mono text-[10px] font-bold text-amber uppercase tracking-[0.2em] mb-2">Import Failed</p>
            <p className="font-mono text-xs text-ink-2">{status.message}</p>
            {status.rowErrors.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1.5 pt-3 border-t border-rule">
                {status.rowErrors.map((err, i) => (
                  <li key={i} className="font-mono text-[9px] text-ink-3">{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Format reference */}
        <div className="border border-rule p-4">
          <p className="font-mono text-[9px] text-ink-3 uppercase tracking-[0.25em] mb-3">Expected Format</p>
          <pre className="font-mono text-[10px] text-ink-2 leading-relaxed overflow-x-auto bg-surface p-3">{`[
  {
    "date": "2026-01-15",
    "exercise": "Bench Press",
    "weight": 60,
    "reps": 8,
    "sets": 4,
    "workoutType": "push"
  }
]`}</pre>
          <p className="font-mono text-[9px] text-ink-3 mt-3">
            workoutType: <span className="text-amber">push</span> · <span className="text-forest">pull</span> · <span className="text-sienna">legs</span>
          </p>
        </div>

      </div>
    </main>
  );
}
