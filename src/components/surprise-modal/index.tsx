"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useSurpriseStore } from "@/stores/surprise.store";
import { acknowledgeSurprise } from "@/services/submissions.service";
import { useAuthStore } from "@/stores/auth.store";
import { useSubmission } from "@/hooks/useSubmission";

const FALLBACK_MESSAGE =
  "O cliente solicitou uma mudança urgente de regra de negócio. Esta feature precisa ir para produção HOJE. Ajuste seu planejamento agora!";

export function SurpriseModal() {
  const { isActive, messages, requirements, dismiss } = useSurpriseStore();
  const { user } = useAuthStore();
  const { submission, loading: submissionLoading } = useSubmission(user?.uid);
  const [input, setInput] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  // Não mostra o modal se: inativo, ainda carregando, ou aluno já confirmou
  if (!isActive || submissionLoading || submission?.surpriseAcknowledged) return null;

  const repoKey = String(user?.assignedRepoId ?? "");
  const message = messages[repoKey] || FALLBACK_MESSAGE;
  const repoRequirements: string[] = requirements[repoKey] ?? [];

  async function handleConfirm() {
    if (input !== "CIENTE") {
      setError('Digite exatamente "CIENTE" (em maiúsculas) para confirmar.');
      return;
    }

    setConfirming(true);
    try {
      if (user?.uid) {
        await acknowledgeSurprise(user.uid, repoRequirements);
      }
      dismiss();
      // Navegação hard após dismiss para evitar conflito com o unmount do modal
      window.location.href = "/phase4-moscow";
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(127, 29, 29, 0.97)" }}
      role="alertdialog"
      aria-modal="true"
      aria-label="Fator Surpresa — Atenção obrigatória"
    >
      <div className="w-full max-w-2xl border-4 border-yellow-400 animate-pulse-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-yellow-400 px-6 py-4 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-800 animate-bounce" aria-hidden="true" />
          <h2 className="text-xl font-black text-red-900 uppercase tracking-wide">
            ⚠️ FATOR SURPRESA — ATENÇÃO IMEDIATA ⚠️
          </h2>
          <AlertTriangle className="w-8 h-8 text-red-800 animate-bounce" aria-hidden="true" />
        </div>

        {/* Corpo */}
        <div className="bg-red-900 px-6 py-6 space-y-5">
          {/* Mensagem do cliente */}
          <div className="bg-red-800 rounded-xl p-5 border border-red-600 space-y-2">
            <p className="text-xs font-bold text-yellow-300 uppercase">
              Mensagem urgente do cliente:
            </p>
            <p className="text-white text-lg font-semibold leading-relaxed">{message}</p>
          </div>

          {/* Novos requisitos a priorizar */}
          {repoRequirements.length > 0 && (
            <div className="bg-yellow-900 rounded-xl p-4 border border-yellow-600 space-y-3">
              <p className="text-xs font-bold text-yellow-300 uppercase">
                Novos itens para priorizar no MoSCoW:
              </p>
              <ul className="space-y-3">
                {repoRequirements.map((req, i) => (
                  <li key={i} className="space-y-1">
                    <div className="flex items-start gap-2 text-yellow-100 text-sm font-medium">
                      <span className="text-yellow-400 font-bold shrink-0">★</span>
                      {req}
                    </div>
                    <p className="ml-5 text-xs font-black text-red-300 uppercase tracking-wide animate-pulse">
                      ⚠️ Esta correção é urgente!!!
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Confirmação */}
          <div className="bg-red-950 rounded-xl p-5 space-y-3">
            <p className="text-yellow-300 font-bold text-sm">
              Para confirmar que você leu e entendeu, digite{" "}
              <span className="bg-yellow-400 text-red-900 px-1 rounded font-black">CIENTE</span>{" "}
              abaixo. Você será redirecionado para revisar sua Matriz MoSCoW.
            </p>
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError("");
              }}
              placeholder='Digite "CIENTE"'
              className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 font-bold text-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 min-h-[48px]"
              aria-label="Campo de confirmação — Digite CIENTE"
            />
            {error && (
              <p className="text-yellow-300 text-sm font-medium">{error}</p>
            )}
            <button
              onClick={handleConfirm}
              disabled={confirming || input !== "CIENTE"}
              className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-700 disabled:text-yellow-500 text-red-900 font-black text-lg rounded-lg transition-colors uppercase tracking-wider min-h-[56px]"
            >
              {confirming ? "Registrando..." : "Confirmar e Ir para MoSCoW →"}
            </button>
          </div>

          <p className="text-center text-red-400 text-xs">
            Este aviso não pode ser fechado até você confirmar a leitura.
          </p>
        </div>
      </div>
    </div>
  );
}
