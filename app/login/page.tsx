"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-paper flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold text-ink">Training Journal</h1>
          <p className="text-sm text-ink-3 mt-2">Personal record book</p>
        </div>

        {sent ? (
          <div className="bg-surface rounded-2xl p-6 border-l-[3px] border-forest">
            <p className="font-mono text-xs font-bold text-forest uppercase tracking-widest mb-3">
              Check your email
            </p>
            <p className="text-sm text-ink">Magic link sent to</p>
            <p className="font-mono text-sm text-ink-2 mt-1 break-all">{email}</p>
            <p className="text-xs text-ink-3 mt-3">
              Tap the link in your email to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="bg-surface rounded-2xl px-5 py-4 text-ink text-sm focus:outline-none focus:ring-1 focus:ring-rule placeholder:text-ink-3"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-ink rounded-2xl text-paper font-mono text-sm font-bold tracking-widest uppercase py-4 active:opacity-80 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Sending..." : "Send Magic Link →"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
