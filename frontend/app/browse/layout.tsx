"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { useProfile } from "@/app/contexts/ProfileContext";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const { activeProfile } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && user && !activeProfile) {
      router.push("/profiles");
    }
  }, [loading, user, activeProfile, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
