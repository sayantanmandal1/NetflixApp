"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface Profile {
  id: string;
  name: string;
  avatar_url: string;
  is_kids: boolean;
}

interface ProfileContextType {
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile) => void;
  clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("netflix_profile");
    if (stored) {
      try {
        setActiveProfileState(JSON.parse(stored));
      } catch {
        localStorage.removeItem("netflix_profile");
      }
    }
  }, []);

  const setActiveProfile = useCallback((profile: Profile) => {
    setActiveProfileState(profile);
    localStorage.setItem("netflix_profile", JSON.stringify(profile));
  }, []);

  const clearProfile = useCallback(() => {
    setActiveProfileState(null);
    localStorage.removeItem("netflix_profile");
  }, []);

  return (
    <ProfileContext.Provider value={{ activeProfile, setActiveProfile, clearProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
