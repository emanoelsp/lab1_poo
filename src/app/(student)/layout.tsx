"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSurprise } from "@/hooks/useSurprise";
import { SurpriseModal } from "@/components/surprise-modal";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import { Bell, X } from "lucide-react";

const phases = [
  { href: "/onboarding", label: "Onboarding", step: 0 },
  { href: "/phase2-uml", label: "1. UML", step: 1 },
  { href: "/phase1-estimation", label: "2. Story Points", step: 2 },
  { href: "/phase3-repository", label: "3. Repositório", step: 3 },
  { href: "/phase4-moscow", label: "4. MoSCoW", step: 4 },
  { href: "/phase5-delivery", label: "5. Entrega", step: 5 },
];

function NotificationBanner() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported" | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("pbl_notif_dismissed") === "1") {
      setDismissed(true);
      return;
    }
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  // Não mostra se: já concedido, negado, não suportado, ou dispensado
  if (dismissed || permission === "granted" || permission === "denied" || permission === "unsupported" || permission === null) {
    return null;
  }

  async function handleEnable() {
    const result = await Notification.requestPermission();
    setPermission(result);
  }

  function handleDismiss() {
    localStorage.setItem("pbl_notif_dismissed", "1");
    setDismissed(true);
  }

  return (
    <div className="bg-blue-700 text-white px-4 py-2.5 flex items-center gap-3">
      <Bell className="w-4 h-4 shrink-0" />
      <p className="text-sm flex-1">
        <strong>Ative as notificações</strong> para ser alertado sobre o Fator Surpresa mesmo com o navegador minimizado.
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleEnable}
          className="bg-white text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors min-h-[32px]"
        >
          Ativar notificações
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Dispensar"
          className="text-blue-200 hover:text-white transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function NotificationStatus() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setPermission(Notification.permission);
  }, []);

  if (permission !== "granted") return null;

  return (
    <span title="Notificações ativas — você será avisado sobre o Fator Surpresa">
      <Bell className="w-3.5 h-3.5 text-green-500" />
    </span>
  );
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useSurprise();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (role === "admin") { router.push("/admin/dashboard"); return; }
    if (!user.profileCompleted) { router.push("/profile"); return; }
  }, [user, loading, role, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || role !== "student") return null;

  async function handleSignOut() {
    document.cookie = "pbl_session=; path=/; max-age=0";
    await signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner de permissão de notificação */}
      <NotificationBanner />

      {/* Barra de navegação */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-blue-700 text-sm flex items-center gap-1.5">
            PBL — Resgate de Projeto
            <NotificationStatus />
          </span>
          <div className="hidden md:flex items-center gap-1">
            {phases.map((p) => {
              const active = pathname === p.href;
              return (
                <Link
                  key={p.href}
                  href={p.href}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {p.label}
                </Link>
              );
            })}
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs text-gray-500 hover:text-red-600 transition-colors"
          >
            Sair
          </button>
        </div>
      </nav>

      {/* Conteúdo da página */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Modal do Fator Surpresa — sempre montado, aparece quando isActive = true */}
      <SurpriseModal />
    </div>
  );
}
