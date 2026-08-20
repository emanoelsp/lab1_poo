"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { triggerSurprise, deactivateSurprise, getSubmissionByUid } from "@/services/admin.service";
import type { AppUser } from "@/types/user.types";
import type { Submission } from "@/types/submission.types";
import { ExternalLink, FileText, Zap, ZapOff, ChevronDown, ChevronUp } from "lucide-react";

const REPOS = [
  { id: "1", label: "Repo 1 — Ligas Esportivas" },
  { id: "2", label: "Repo 2 — Obras e Empreendimentos" },
  { id: "3", label: "Repo 3 — Logística e Roteamento" },
] as const;

const REPO_NAMES: Record<number, string> = {
  1: "Ligas Esportivas",
  2: "Obras",
  3: "Logística",
};

const DEFAULT_MESSAGES: Record<string, string> = {
  "1": "O cliente precisa urgente de um histórico de transferências de jogadores. Toda transferência deve ser registrada com data, time de origem e time de destino. Revise seu MoSCoW agora!",
  "2": "O cliente descobriu que obras canceladas continuam aparecendo no relatório de andamento. O método cancelarObra tem um bug que retorna dados incorretos. Corrija e inclua isso no seu planejamento!",
  "3": "O cliente identificou que cargas canceladas não estão liberando o peso do caminhão corretamente. O sistema apresenta inconsistência no estado da frota. Esta correção é urgente!",
};

const DEFAULT_REQUIREMENTS: Record<string, string> = {
  "1": "Implementar rastreamento histórico de transferências de jogadores (data, origem e destino)",
  "2": "Corrigir bug em cancelarObra que retorna quantidade incorreta de materiais liberados",
  "3": "Corrigir bug em cancelarEntrega que não remove cargaId da lista do caminhão",
};

export default function AdminDashboard() {
  const [students, setStudents] = useState<AppUser[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [surpriseActive, setSurpriseActive] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [messages, setMessages] = useState<Record<string, string>>(DEFAULT_MESSAGES);
  const [requirementTexts, setRequirementTexts] = useState<Record<string, string>>(DEFAULT_REQUIREMENTS);

  // Ouve alunos em tempo real
  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "student"));
    return onSnapshot(
      q,
      async (snap) => {
        const users = snap.docs.map((d) => d.data() as AppUser);
        setStudents(users);
        const subs: Record<string, Submission> = {};
        for (const u of users) {
          const sub = await getSubmissionByUid(u.uid);
          if (sub) subs[u.uid] = sub;
        }
        setSubmissions(subs);
      },
      (error) => console.warn("[admin] students onSnapshot error:", error.code)
    );
  }, []);

  // Ouve status do Fator Surpresa
  useEffect(() => {
    return onSnapshot(
      doc(db, "admin_triggers", "surprise"),
      (snap) => {
        if (snap.exists()) setSurpriseActive(snap.data().isActive ?? false);
      },
      (error) => console.warn("[admin] surprise onSnapshot error:", error.code)
    );
  }, []);

  async function handleTrigger() {
    setTriggering(true);
    try {
      const requirements: Record<string, string[]> = {};
      for (const repo of REPOS) {
        requirements[repo.id] = requirementTexts[repo.id]
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      await triggerSurprise(messages, requirements);
    } finally {
      setTriggering(false);
    }
  }

  const totalSP = (points: Record<string, number>) =>
    Object.values(points).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
        <p className="text-gray-500 mt-1">Acompanhe o progresso dos grupos em tempo real.</p>
      </div>

      {/* Fator Surpresa */}
      <div className="bg-gray-900 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">🚨 Fator Surpresa</h2>
            <p className="text-gray-400 text-sm">
              {surpriseActive
                ? "ATIVO — alunos estão vendo o modal agora"
                : "Inativo — configure as mensagens por repositório e dispare"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {surpriseActive && (
              <span className="flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                <Zap className="w-3 h-3" /> AO VIVO
              </span>
            )}
            {!surpriseActive && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors"
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {expanded ? "Fechar" : "Configurar"}
              </button>
            )}
          </div>
        </div>

        {/* Config por repo — expansível */}
        {!surpriseActive && expanded && (
          <div className="border-t border-gray-700 px-6 pb-6 pt-4 space-y-5">
            {REPOS.map((repo) => (
              <div key={repo.id} className="space-y-2">
                <p className="text-yellow-400 text-xs font-bold uppercase tracking-wide">{repo.label}</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-gray-400 text-xs">Mensagem para os alunos</label>
                    <textarea
                      value={messages[repo.id]}
                      onChange={(e) => setMessages((m) => ({ ...m, [repo.id]: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                      placeholder={`Mensagem urgente para alunos do ${repo.label}...`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-400 text-xs">
                      Novos requisitos MoSCoW{" "}
                      <span className="text-gray-600">(um por linha)</span>
                    </label>
                    <textarea
                      value={requirementTexts[repo.id]}
                      onChange={(e) => setRequirementTexts((r) => ({ ...r, [repo.id]: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm resize-none"
                      placeholder="Ex: Implementar rastreamento de transferências..."
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleTrigger}
              disabled={triggering}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-900 text-white font-bold rounded-xl transition-colors min-h-[48px]"
            >
              <Zap className="w-5 h-5" />
              {triggering ? "Disparando..." : "DISPARAR FATOR SURPRESA"}
            </button>
          </div>
        )}

        {/* Desativar */}
        {surpriseActive && (
          <div className="border-t border-gray-700 px-6 pb-5 pt-4">
            <button
              onClick={deactivateSurprise}
              className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors min-h-[48px]"
            >
              <ZapOff className="w-5 h-5" />
              Desativar Surpresa
            </button>
          </div>
        )}
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total de Alunos", value: students.length },
          { label: "Entregas Completas", value: Object.values(submissions).filter((s) => s.submittedAt).length },
          { label: "Cientes da Surpresa", value: Object.values(submissions).filter((s) => s.surpriseAcknowledged).length },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Lista de alunos */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Grupos</h2>
        </div>
        {students.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Nenhum aluno cadastrado ainda.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {students.map((student) => {
              const sub = submissions[student.uid];
              return (
                <div key={student.uid} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{student.groupMembers?.join(", ") || student.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Repo #{student.assignedRepoId} — {REPO_NAMES[student.assignedRepoId ?? 1]}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {sub?.initialStoryPoints && (
                      <span className="text-gray-500">
                        SP:{" "}
                        <strong>{totalSP(sub.initialStoryPoints)}</strong>→
                        <strong className="text-blue-700">{totalSP(sub.finalStoryPoints)}</strong>
                      </span>
                    )}

                    {sub?.moscowMatrix?.must?.length > 0 && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">MoSCoW ✓</span>
                    )}

                    {sub?.surpriseAcknowledged ? (
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Ciente ✓</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">Pendente</span>
                    )}

                    {sub?.githubLink && (
                      <a
                        href={sub.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4" /> GitHub
                      </a>
                    )}

                    {sub?.pdfUrl && (
                      <a
                        href={sub.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-purple-600 hover:text-purple-800"
                      >
                        <FileText className="w-4 h-4" /> PDF
                      </a>
                    )}

                    {sub?.submittedAt && (
                      <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">Entregue ✓</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
