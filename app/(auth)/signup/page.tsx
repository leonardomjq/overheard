"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-accent-green font-mono font-bold text-2xl">
              Scout
            </span>
            <span className="text-text-muted font-mono text-2xl">Agent</span>
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-xl p-8">
          <h1 className="text-xl font-semibold mb-6">Create account</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-accent-green"
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-accent-green"
              />
              <p className="text-xs text-text-muted mt-1">
                Minimum 8 characters
              </p>
            </div>

            {error && (
              <p className="text-accent-red text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-green text-bg py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-text-muted text-sm mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-accent-green hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
