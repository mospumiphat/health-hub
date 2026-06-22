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
          setStatus({
            kind: "error",
            message: "No valid workout records found.",
            rowErrors: errors.slice(0, 5),
          });
          return;
        }

        const { added, skipped } = mergeSessions(sessions);
        setStatus({ kind: "success", added, skipped });
      } catch {
        setStatus({
          kind: "error",
          message: "Invalid JSON file. Make sure the file contains a valid JSON array.",
          rowErrors: [],
        });
      }
    };
    reader.readAsText(file);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col pb-10">
      {/* Header */}
      <div className="px-4 pt-12 pb-5 flex items-center gap-3">
        <Link href="/" className="text-zinc-400 text-sm active:text-white">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">Import History</h1>
      </div>

      <div className="px-4 flex flex-col gap-5">

        {/* Upload area */}
        <button
          onClick={() => fileRef.current?.click()}
          className={`w-full border-2 border-dashed rounded-2xl py-12 flex flex-col items-center gap-3 transition-colors active:scale-[0.98] transition-transform ${
            status.kind === "success"
              ? "border-green-600 bg-green-900/10"
              : status.kind === "error"
              ? "border-red-700 bg-red-900/10"
              : "border-zinc-700 active:border-zinc-500"
          }`}
        >
          <span className="text-4xl">
            {status.kind === "success" ? "✅" : status.kind === "error" ? "❌" : "📂"}
          </span>
          <div className="text-center">
            <p className="text-sm font-semibold text-zinc-300">
              {fileName || "Tap to select JSON file"}
            </p>
            {fileName && status.kind === "idle" && (
              <p className="text-xs text-zinc-600 mt-1">{fileName}</p>
            )}
          </div>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFile}
        />

        {/* Success */}
        {status.kind === "success" && (
          <div className="bg-green-900/30 border border-green-700/50 rounded-2xl p-4">
            <p className="text-green-400 font-bold text-base mb-1">Import successful</p>
            <p className="text-zinc-300 text-sm">
              {status.added} session{status.added !== 1 ? "s" : ""} added to history
            </p>
            {status.skipped > 0 && (
              <p className="text-zinc-500 text-xs mt-1">
                {status.skipped} duplicate{status.skipped !== 1 ? "s" : ""} skipped
              </p>
            )}
            <Link href="/history">
              <button className="mt-3 w-full bg-green-700 active:bg-green-600 text-white text-sm font-semibold rounded-xl py-3 transition-transform active:scale-95">
                View History →
              </button>
            </Link>
          </div>
        )}

        {/* Error */}
        {status.kind === "error" && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-2xl p-4">
            <p className="text-red-400 font-bold text-base mb-1">Import failed</p>
            <p className="text-zinc-300 text-sm">{status.message}</p>
            {status.rowErrors.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1.5 border-t border-red-900 pt-3">
                {status.rowErrors.map((err, i) => (
                  <li key={i} className="text-xs text-zinc-500">
                    {err}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Format reference */}
        <div className="bg-zinc-900 rounded-2xl p-4">
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-widest mb-3">
            Expected format
          </p>
          <pre className="text-xs text-zinc-500 leading-relaxed overflow-x-auto bg-zinc-950 rounded-xl p-3">{`[
  {
    "date": "2026-01-15",
    "exercise": "Bench Press",
    "weight": 60,
    "reps": 8,
    "sets": 4,
    "workoutType": "push"
  }
]`}</pre>
          <div className="mt-3 flex gap-2">
            {["push", "pull", "legs"].map((t) => (
              <span key={t} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-lg font-mono">
                {t}
              </span>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
