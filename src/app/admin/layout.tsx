"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (role !== "admin") { router.push("/onboarding"); }
  }, [user, loading, role, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || role !== "admin") return null;

  async function handleSignOut() {
    document.cookie = "pbl_session=; path=/; max-age=0";
    await signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <span className="font-bold">PBL — Painel do Professor</span>
          <span className="ml-3 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Admin</span>
        </div>
        <button onClick={handleSignOut} className="text-sm text-gray-400 hover:text-white transition-colors">
          Sair
        </button>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
