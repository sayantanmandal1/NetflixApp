"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NetflixIntro from "@/app/components/NetflixIntro";

export default function Home() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Skip intro if already seen this session
    if (typeof window !== "undefined" && sessionStorage.getItem("netflix_intro_seen")) {
      setShowIntro(false);
    }
  }, []);

  useEffect(() => {
    if (!showIntro) {
      const token = typeof window !== "undefined" ? localStorage.getItem("netflix_token") : null;
      if (token) {
        router.replace("/profiles");
      } else {
        router.replace("/login");
      }
    }
  }, [showIntro, router]);

  if (!showIntro) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <NetflixIntro
      onComplete={() => {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("netflix_intro_seen", "1");
        }
        setShowIntro(false);
      }}
    />
  );
}
