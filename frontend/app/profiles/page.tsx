"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { useProfile } from "@/app/contexts/ProfileContext";
import { api } from "@/app/lib/api";
import Image from "next/image";

const AVATARS = [
  "/avatars/avatar1.png",
  "/avatars/avatar2.png",
  "/avatars/avatar3.png",
  "/avatars/avatar4.png",
  "/avatars/avatar5.png",
  "/avatars/avatar6.png",
  "/avatars/avatar7.png",
  "/avatars/avatar8.png",
];

const AVATAR_COLORS = [
  "#e50914",
  "#b81d24",
  "#221f1f",
  "#f5f5f1",
  "#0080ff",
  "#ffc601",
  "#04fd8f",
  "#a601f4",
];

interface Profile {
  id: string;
  name: string;
  avatar_url: string;
  is_kids: boolean;
}

export default function ProfilesPage() {
  const { user, loading: authLoading } = useAuth();
  const { setActiveProfile } = useProfile();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [managing, setManaging] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProfile, setEditProfile] = useState<Profile | null>(null);
  const [newName, setNewName] = useState("");
  const [newAvatar, setNewAvatar] = useState(0);
  const [isKids, setIsKids] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user]);

  const fetchProfiles = async () => {
    try {
      const data = await api.profiles.list();
      setProfiles(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = (profile: Profile) => {
    if (managing) {
      setEditProfile(profile);
      setNewName(profile.name);
      setNewAvatar(AVATARS.indexOf(profile.avatar_url) >= 0 ? AVATARS.indexOf(profile.avatar_url) : 0);
      setIsKids(profile.is_kids);
      return;
    }
    setActiveProfile(profile);
    router.push("/browse");
  };

  const handleAddProfile = async () => {
    if (!newName.trim()) return;
    try {
      await api.profiles.create({
        name: newName,
        avatar_url: AVATARS[newAvatar] || AVATARS[0],
        is_kids: isKids,
      });
      setShowAddModal(false);
      setNewName("");
      setNewAvatar(0);
      setIsKids(false);
      fetchProfiles();
    } catch {
      // ignore
    }
  };

  const handleUpdateProfile = async () => {
    if (!editProfile || !newName.trim()) return;
    try {
      await api.profiles.update(editProfile.id, {
        name: newName,
        avatar_url: AVATARS[newAvatar] || AVATARS[0],
        is_kids: isKids,
      });
      setEditProfile(null);
      fetchProfiles();
    } catch {
      // ignore
    }
  };

  const handleDeleteProfile = async () => {
    if (!editProfile) return;
    try {
      await api.profiles.delete(editProfile.id);
      setEditProfile(null);
      fetchProfiles();
    } catch {
      // ignore
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl md:text-5xl text-white mb-8">
        {managing ? "Manage Profiles:" : "Who's watching?"}
      </h1>

      <div className="flex flex-wrap justify-center gap-6 mb-10">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => handleSelectProfile(profile)}
            className="group flex flex-col items-center gap-3 text-center"
          >
            <div
              className={`w-[120px] h-[120px] md:w-[150px] md:h-[150px] rounded overflow-hidden transition-all duration-200 ${
                managing
                  ? "border-2 border-white/40"
                  : "border-2 border-transparent group-hover:border-white"
              }`}
              style={{ backgroundColor: AVATAR_COLORS[AVATARS.indexOf(profile.avatar_url)] || "#333" }}
            >
              <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-white">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <span className="text-[#808080] group-hover:text-white text-sm md:text-base transition-colors">
              {profile.name}
            </span>
            {managing && (
              <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            )}
          </button>
        ))}

        {profiles.length < 5 && !managing && (
          <button
            onClick={() => {
              setShowAddModal(true);
              setNewName("");
              setNewAvatar(profiles.length % AVATARS.length);
              setIsKids(false);
            }}
            className="group flex flex-col items-center gap-3"
          >
            <div className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] rounded border-2 border-transparent bg-[#333] flex items-center justify-center group-hover:bg-[#444] transition-colors">
              <svg className="w-16 h-16 text-[#808080] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-[#808080] group-hover:text-white text-sm md:text-base transition-colors">
              Add Profile
            </span>
          </button>
        )}
      </div>

      <button
        onClick={() => setManaging(!managing)}
        className={`px-8 py-2 text-lg border transition-colors ${
          managing
            ? "border-white text-black bg-white hover:bg-[#e50914] hover:text-white hover:border-[#e50914]"
            : "border-[#808080] text-[#808080] hover:border-white hover:text-white"
        }`}
      >
        {managing ? "Done" : "Manage Profiles"}
      </button>

      {/* Add Profile Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#2b2b2b] rounded-lg max-w-md w-full p-8 animate-scale-in">
            <h2 className="text-2xl font-bold mb-6">Add Profile</h2>
            <div className="flex flex-wrap gap-3 mb-6">
              {AVATARS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setNewAvatar(idx)}
                  className={`w-14 h-14 rounded flex items-center justify-center text-xl font-bold transition-all ${
                    newAvatar === idx ? "ring-2 ring-white scale-110" : "opacity-50 hover:opacity-80"
                  }`}
                  style={{ backgroundColor: AVATAR_COLORS[idx] }}
                >
                  {String.fromCharCode(65 + idx)}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name"
              maxLength={100}
              className="w-full h-12 bg-[#444] text-white px-4 rounded mb-4 outline-none focus:ring-2 focus:ring-[#e50914]"
            />
            <label className="flex items-center gap-3 mb-6 cursor-pointer text-sm text-[#b3b3b3]">
              <input
                type="checkbox"
                checked={isKids}
                onChange={(e) => setIsKids(e.target.checked)}
                className="accent-[#e50914] w-5 h-5"
              />
              Kids Profile
            </label>
            <div className="flex gap-3">
              <button
                onClick={handleAddProfile}
                className="flex-1 h-12 bg-[#e50914] hover:bg-[#f40612] text-white font-bold rounded transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 h-12 bg-[#444] hover:bg-[#555] text-white rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editProfile && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#2b2b2b] rounded-lg max-w-md w-full p-8 animate-scale-in">
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
            <div className="flex flex-wrap gap-3 mb-6">
              {AVATARS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setNewAvatar(idx)}
                  className={`w-14 h-14 rounded flex items-center justify-center text-xl font-bold transition-all ${
                    newAvatar === idx ? "ring-2 ring-white scale-110" : "opacity-50 hover:opacity-80"
                  }`}
                  style={{ backgroundColor: AVATAR_COLORS[idx] }}
                >
                  {String.fromCharCode(65 + idx)}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name"
              maxLength={100}
              className="w-full h-12 bg-[#444] text-white px-4 rounded mb-4 outline-none focus:ring-2 focus:ring-[#e50914]"
            />
            <label className="flex items-center gap-3 mb-6 cursor-pointer text-sm text-[#b3b3b3]">
              <input
                type="checkbox"
                checked={isKids}
                onChange={(e) => setIsKids(e.target.checked)}
                className="accent-[#e50914] w-5 h-5"
              />
              Kids Profile
            </label>
            <div className="flex gap-3">
              <button
                onClick={handleUpdateProfile}
                className="flex-1 h-12 bg-[#e50914] hover:bg-[#f40612] text-white font-bold rounded transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleDeleteProfile}
                className="h-12 px-6 bg-transparent border border-[#808080] text-[#808080] hover:text-white hover:border-white rounded transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setEditProfile(null)}
                className="flex-1 h-12 bg-[#444] hover:bg-[#555] text-white rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
