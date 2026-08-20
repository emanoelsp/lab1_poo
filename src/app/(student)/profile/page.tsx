"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { createProfile } from "@/services/users.service";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [members, setMembers] = useState<string[]>(["", "", ""]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filledMembers = members.filter((m) => m.trim().length >= 2);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (filledMembers.length < 2) {
      setError("Informe ao menos 2 integrantes com nome válido.");
      return;
    }

    setSaving(true);
    try {
      if (!user?.uid) return;
      const updated = await createProfile(user.uid, filledMembers);
      setUser(updated);
      router.push("/onboarding");
    } catch {
      setError("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete seu Perfil</h1>
        <p className="text-gray-500 text-sm mb-6">
          Informe os nomes dos integrantes do grupo (mínimo 2, máximo 3). Após salvar, seu repositório será sorteado automaticamente.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          {members.map((member, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Integrante {i + 1}{" "}
                {i < 2 ? <span className="text-red-500">*</span> : <span className="text-gray-400 text-xs">(opcional)</span>}
              </label>
              <input
                type="text"
                value={member}
                onChange={(e) => {
                  const updated = [...members];
                  updated[i] = e.target.value;
                  setMembers(updated);
                }}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[48px]"
                placeholder={`Nome do integrante ${i + 1}`}
              />
            </div>
          ))}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving || filledMembers.length < 2}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors min-h-[48px]"
          >
            {saving ? "Salvando..." : "Salvar e Continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}
