"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      router.push("/profiles");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] relative">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.8) 100%)",
        }}
      />

      <header className="relative z-10 px-[3%] py-6">
        <Link href="/">
          <svg viewBox="0 0 111 30" className="h-[45px] fill-[#e50914]">
            <path d="M105.06 14.28L111 30c-1.75-.25-3.5-.5-5.25-.58l-3.35-9.6-3.35 9.6c-1.72.08-3.43.33-5.15.58l5.98-15.72L94.37 0h5.1l3.3 8.84L106.06 0h5.1l-6.1 14.28zM90.43 0v27.23c-1.6.07-3.2.2-4.8.37V0h4.8zm-8.2 0v27.97c-1.57.17-3.13.4-4.7.65V0h4.7zM67.1 7.5v2.11c1.37-1.57 3.17-2.5 5.35-2.5 4.2 0 6.44 2.83 6.44 7.17v13.35c-1.53.3-3.06.66-4.57 1.05V14.67c0-2.36-1.05-3.64-3-3.64-1.63 0-2.92.87-4.22 2.36v15.67c-1.53.43-3.07.9-4.57 1.38V0h4.57v7.5zm-15.27-.53c4.75 0 7.57 3.28 7.57 8.28v.52c0 .27 0 .55-.02.82H46.8c.37 3.2 2.14 4.55 4.97 4.55 1.87 0 3.42-.58 4.88-1.44l1.44 3.55c-1.83 1.1-4.25 1.87-7 1.87-5.48 0-9.08-3.4-9.08-9s3.2-9.15 8.82-9.15zm3.12 7.53c0-2.58-1.05-4.13-3.2-4.13-1.87 0-3.37 1.35-3.72 4.13h6.92zM38.13 7.38v19.26l-4.57 1.62V12.38l-3.23-1.12 1.2-3.88h6.6zm-2.2-7.38c1.6 0 2.85 1.26 2.85 2.88 0 1.6-1.25 2.87-2.85 2.87-1.6 0-2.88-1.27-2.88-2.87 0-1.62 1.28-2.88 2.88-2.88zM21.9 20.97l1.65-3.83c1.85 1.2 3.73 1.73 5.6 1.73 1.85 0 2.72-.65 2.72-1.63 0-3.15-9.47-1.43-9.47-8.2 0-3.4 2.85-5.93 7.35-5.93 2.47 0 4.72.6 6.48 1.67l-1.55 3.82c-1.5-.88-3.28-1.47-5.07-1.47-1.58 0-2.55.58-2.55 1.5 0 3.1 9.47 1.37 9.47 8.17 0 3.5-2.82 6.08-7.47 6.08-2.97 0-5.5-.75-7.16-1.9zM0 0h5.1l5.85 16.55V0h4.8v30H11.1L5 12.94V30H0V0z" />
          </svg>
        </Link>
      </header>

      <main className="relative z-10 flex justify-center px-4 pb-20">
        <div className="w-full max-w-[450px] bg-black/75 rounded-md px-[68px] py-12 mt-4">
          <h1 className="text-[32px] font-bold text-white mb-7">Sign Up</h1>

          {error && (
            <div className="bg-[#e87c03] text-white text-sm px-5 py-2.5 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="peer w-full h-[50px] rounded bg-[#333] text-white text-base px-5 pt-4 border border-transparent focus:border-[#e50914] outline-none transition-colors"
                placeholder=" "
              />
              <label className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8c8c8c] text-sm transition-all duration-150 pointer-events-none peer-focus:top-3 peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[11px]">
                Email
              </label>
            </div>

            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="peer w-full h-[50px] rounded bg-[#333] text-white text-base px-5 pt-4 border border-transparent focus:border-[#e50914] outline-none transition-colors"
                placeholder=" "
              />
              <label className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8c8c8c] text-sm transition-all duration-150 pointer-events-none peer-focus:top-3 peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[11px]">
                Password
              </label>
            </div>

            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="peer w-full h-[50px] rounded bg-[#333] text-white text-base px-5 pt-4 border border-transparent focus:border-[#e50914] outline-none transition-colors"
                placeholder=" "
              />
              <label className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8c8c8c] text-sm transition-all duration-150 pointer-events-none peer-focus:top-3 peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[11px]">
                Confirm Password
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#e50914] hover:bg-[#f40612] text-white text-base font-bold rounded transition-colors disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-16 text-[#737373]">
            <p>
              Already have an account?{" "}
              <Link href="/login" className="text-white hover:underline">
                Sign in
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
