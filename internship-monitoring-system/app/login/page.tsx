"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        setError(error.message);
        return;
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        setError("Session was not created");
        return;
        }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", session.user.id)
      .maybeSingle();

    const role = profile?.role ?? "coordinator";

    router.refresh();
    router.push(role === "admin" ? "/admin/dashboard" : "/coordinator/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#cfcfcf] text-slate-950">
      <div className="flex min-h-screen">
        <section className="flex w-full max-w-[460px] flex-col bg-[#f7f7f7] px-10 py-16 shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
          <div className="max-w-[380px]">
            <h1 className="mb-8 max-w-[250px] text-[2.15rem] font-black uppercase leading-[0.86] tracking-[-0.05em] text-black">
              LOG IN YOUR ACCOUNT
            </h1>

            <form onSubmit={handleLogin} className="space-y-5">
              <label className="block text-[0.95rem] text-slate-900">
                <span className="mb-2 block">Email</span>
                <input
                  type="email"
                  placeholder=""
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-[6px] border border-[#dddddd] bg-[#efefef] px-3 text-[0.95rem] outline-none transition focus:border-slate-400"
                />
              </label>

              <label className="block text-[0.95rem] text-slate-900">
                <span className="mb-2 block">Password</span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-[6px] border border-[#dddddd] bg-[#efefef] px-3 pr-11 text-[0.95rem] outline-none transition focus:border-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <div className="flex justify-end pt-1">
                <a href="#" className="text-[0.92rem] text-[#5f7d9b] hover:underline">
                  Forgot My Password
                </a>
              </div>

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="h-11 w-full rounded-[6px] bg-[#dddddd] text-[0.95rem] font-medium uppercase tracking-[-0.02em] text-black transition hover:bg-[#d3d3d3] focus:outline-none focus:ring-2 focus:ring-black/15"
              >
                LOG IN
              </button>

              <div className="flex items-center gap-4 py-1 text-[0.95rem] text-slate-900">
                <span className="h-px flex-1 bg-transparent" />
                <span>or</span>
                <span className="h-px flex-1 bg-transparent" />
              </div>

              <button
                type="button"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-[6px] bg-[#dddddd] text-[0.95rem] text-black transition hover:bg-[#d3d3d3]"
              >
                <span className="h-4 w-4 rounded-full bg-[#c7c7c7]" aria-hidden="true" />
                Continue with Google
              </button>

              <p className="pt-2 text-center text-[0.95rem] text-slate-900">
                No account?{" "}
                <a href="#" className="text-[#5f7d9b] hover:underline">
                  Create account
                </a>
              </p>
            </form>
          </div>
        </section>

        <section className="hidden flex-1 bg-[#cfcfcf] lg:block" aria-hidden="true" />
      </div>
    </main>
  );
}
