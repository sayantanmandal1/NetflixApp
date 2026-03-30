"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRecaptchaInfo, setShowRecaptchaInfo] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState({ num1: 0, num2: 0, answer: 0 });
  const { register } = useAuth();
  const router = useRouter();

  // Generate simple math captcha
  useEffect(() => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion({ num1, num2, answer: num1 + num2 });
  }, []);

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
    
    // Validate captcha
    if (parseInt(captchaAnswer) !== captchaQuestion.answer) {
      setError("Please solve the math problem correctly");
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
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://assets.nflxext.com/ffe/siteui/vlv3/47c2bc92-5a2a-4f33-8f91-4314e9e62ef1/web/IN-en-20240916-TRIFECTA-perspective_72df5d07-cf3f-4530-9afd-8f1d92d7f1a8_large.jpg')",
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%)",
        }}
      />

      <header className="relative z-10 px-4 md:px-[3%] py-5 md:py-6 flex items-center justify-between">
        <Link href="/" className="focus:outline-none focus:ring-2 focus:ring-white rounded">
          <svg viewBox="0 0 111 30" className="h-[25px] md:h-[45px] w-auto fill-[#e50914]" aria-label="Netflix">
            <path d="M105.06233,14.2806261 L110.999156,30 C109.249227,29.7497422 107.500234,29.4366857 105.718437,29.1554972 L102.374168,20.4686475 L98.9371075,28.4375293 C97.2499766,28.1563408 95.5928391,28.061674 93.9057081,27.8432843 L99.9372012,14.0931671 L94.4680851,-5.68434189e-14 L99.5313525,-5.68434189e-14 L102.593495,7.87421502 L105.874965,-5.68434189e-14 L110.999156,-5.68434189e-14 L105.06233,14.2806261 Z M90.4686475,-5.68434189e-14 L85.8749649,-5.68434189e-14 L85.8749649,27.2499766 C87.3746368,27.3437061 88.9371075,27.4055675 90.4686475,27.5930265 L90.4686475,-5.68434189e-14 Z M81.9055207,26.93692 C77.7186241,26.6557316 73.5307901,26.4064111 69.250164,26.3117443 L69.250164,-5.68434189e-14 L73.9366389,-5.68434189e-14 L73.9366389,21.8745899 C76.6248008,21.9373887 79.3120255,22.1557784 81.9055207,22.2804387 L81.9055207,26.93692 Z M64.2496954,10.6561065 L64.2496954,15.3435186 L57.8442216,15.3435186 L57.8442216,25.9996251 L53.2186709,25.9996251 L53.2186709,-5.68434189e-14 L66.3436123,-5.68434189e-14 L66.3436123,4.68741213 L57.8442216,4.68741213 L57.8442216,10.6561065 L64.2496954,10.6561065 Z M45.3435186,4.68741213 L45.3435186,26.2498828 C43.7810479,26.2498828 42.1876465,26.2498828 40.6561065,26.3117443 L40.6561065,4.68741213 L35.8121661,4.68741213 L35.8121661,-5.68434189e-14 L50.2183897,-5.68434189e-14 L50.2183897,4.68741213 L45.3435186,4.68741213 Z M30.749836,15.5928391 C28.687787,15.5928391 26.2498828,15.5928391 24.4999531,15.6875059 L24.4999531,22.6562939 C27.2499766,22.4678976 30,22.2495079 32.7809542,22.1557784 L32.7809542,26.6557316 L19.812541,27.6876933 L19.812541,-5.68434189e-14 L32.7809542,-5.68434189e-14 L32.7809542,4.68741213 L24.4999531,4.68741213 L24.4999531,10.9991564 C26.3126816,10.9991564 29.0936358,10.9054269 30.749836,10.9054269 L30.749836,15.5928391 Z M4.78114163,12.9684132 L4.78114163,29.3429562 C3.09401069,29.5313525 1.59340144,29.7497422 0,30 L0,-5.68434189e-14 L4.4690224,-5.68434189e-14 L10.562377,17.0315868 L10.562377,-5.68434189e-14 L15.2497891,-5.68434189e-14 L15.2497891,28.061674 C13.5935889,28.3437998 11.906458,28.4375293 10.1246602,28.6868498 L4.78114163,12.9684132 Z" />
          </svg>
        </Link>
      </header>

      <main className="relative z-10 flex justify-center px-4 pb-20 pt-8">
        <div className="w-full max-w-[450px] bg-black/75 rounded-[4px] px-[68px] py-[60px]">
          <h1 className="text-[33px] font-bold text-white mb-[28px]">Sign Up</h1>

          {error && (
            <div className="bg-[#e87c03] text-white text-[13px] px-5 py-[10px] rounded-[4px] mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="relative mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="peer w-full h-[50px] rounded-[4px] bg-[#333333] text-white text-[16px] px-5 pt-[18px] pb-[2px] border border-transparent focus:border-white focus:ring-0 outline-none transition-all"
                placeholder=" "
                id="email"
              />
              <label 
                htmlFor="email"
                className="absolute left-5 top-[16px] text-[#8c8c8c] text-[16px] transition-all duration-150 pointer-events-none peer-focus:top-[8px] peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-[8px] peer-[:not(:placeholder-shown)]:text-[11px]"
              >
                Email
              </label>
            </div>

            <div className="relative mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="peer w-full h-[50px] rounded-[4px] bg-[#333333] text-white text-[16px] px-5 pt-[18px] pb-[2px] border border-transparent focus:border-white focus:ring-0 outline-none transition-all"
                placeholder=" "
                id="password"
              />
              <label 
                htmlFor="password"
                className="absolute left-5 top-[16px] text-[#8c8c8c] text-[16px] transition-all duration-150 pointer-events-none peer-focus:top-[8px] peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-[8px] peer-[:not(:placeholder-shown)]:text-[11px]"
              >
                Password
              </label>
            </div>

            <div className="relative mb-4">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="peer w-full h-[50px] rounded-[4px] bg-[#333333] text-white text-[16px] px-5 pt-[18px] pb-[2px] border border-transparent focus:border-white focus:ring-0 outline-none transition-all"
                placeholder=" "
                id="confirmPassword"
              />
              <label 
                htmlFor="confirmPassword"
                className="absolute left-5 top-[16px] text-[#8c8c8c] text-[16px] transition-all duration-150 pointer-events-none peer-focus:top-[8px] peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-[8px] peer-[:not(:placeholder-shown)]:text-[11px]"
              >
                Confirm Password
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] bg-[#e50914] hover:bg-[#c11119] text-white text-[16px] font-medium rounded-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-5"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            {/* Simple Math CAPTCHA */}
            <div className="bg-[#f9f9f9] border border-[#d3d3d3] rounded-[4px] p-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="bg-white border border-[#d3d3d3] rounded px-3 py-2 text-[#333] font-mono text-lg">
                    {captchaQuestion.num1}
                  </div>
                  <span className="text-[#333] text-xl font-bold">+</span>
                  <div className="bg-white border border-[#d3d3d3] rounded px-3 py-2 text-[#333] font-mono text-lg">
                    {captchaQuestion.num2}
                  </div>
                  <span className="text-[#333] text-xl font-bold">=</span>
                  <input
                    type="number"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    required
                    className="w-[70px] bg-white border border-[#d3d3d3] rounded px-3 py-2 text-[#333] font-mono text-lg outline-none focus:border-[#1a73e8]"
                    placeholder="?"
                  />
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <svg className="w-6 h-6 text-[#1a73e8]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <span className="text-[#333] text-xs">Solve to verify you&apos;re human</span>
                </div>
              </div>
            </div>
          </form>

          <div className="mt-[60px]">
            <p className="text-[#737373] text-[16px] mb-3">
              Already have an account?{" "}
              <Link href="/login" className="text-white hover:underline font-normal">
                Sign in
              </Link>
              .
            </p>
            <div className="text-[#8c8c8c] text-[13px] leading-[18px]">
              <p>
                This page is protected by Google reCAPTCHA to ensure you&apos;re not a bot.{" "}
                <button 
                  onClick={() => setShowRecaptchaInfo(!showRecaptchaInfo)}
                  className="text-[#0071eb] hover:underline"
                >
                  Learn more
                </button>
                .
              </p>
              {showRecaptchaInfo && (
                <div className="mt-3 text-[#8c8c8c]">
                  <p>
                    The information collected by Google reCAPTCHA is subject to the Google{" "}
                    <a href="#" className="text-[#0071eb] hover:underline">Privacy Policy</a> and{" "}
                    <a href="#" className="text-[#0071eb] hover:underline">Terms of Service</a>, and is used for providing, maintaining, and improving the reCAPTCHA service and for general security purposes (it is not used for personalized advertising by Google).
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
