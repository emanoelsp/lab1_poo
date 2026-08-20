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

const MOSCOW_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  must:   { label: "Must Have",   color: "text-red-700",    bg: "bg-red-50 border-red-200" },
  should: { label: "Should Have", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  could:  { label: "Could Have",  color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
  wont:   { label: "Won't Have",  color: "text-slate-600",  bg: "bg-slate-100 border-slate-300" },
};

function SubmissionDetail({ sub }: { sub: Submission }) {
  const initialPoints = sub.initialStoryPoints ?? {};
  const finalPoints = sub.finalStoryPoints ?? {};
  const features = Object.keys(initialPoints);
  const surpriseReqs = sub.surpriseRequirements ?? [];

  return (
    <div className="px-6 pb-6 space-y-6 bg-gray-50 border-t border-gray-100">

      {/* Story Points Comparativo */}
      {features.length > 0 && (
        <div className="pt-4 space-y-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Story Points — Comparativo</h3>
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
            <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-bold text-gray-500 uppercase">
              <span className="col-span-5">Funcionalidade</span>
              <span className="col-span-2 text-center">Inicial</span>
              <span className="col-span-2 text-center">Final</span>
              <span className="col-span-3 text-center">Δ Delta</span>
            </div>
            {features.map((f) => {
              const ini = initialPoints[f] ?? 0;
              const fin = finalPoints[f];
              const delta = fin !== undefined ? fin - ini : null;
              return (
                <div key={f} className="grid grid-cols-12 border-b border-gray-100 last:border-0 px-4 py-2.5 items-center">
                  <span className="col-span-5 text-xs text-gray-700">{f}</span>
                  <span className="col-span-2 text-center text-xs font-bold text-gray-500">{ini}</span>
                  <span className="col-span-2 text-center text-xs font-bold text-blue-700">{fin ?? "—"}</span>
                  <span className={`col-span-3 text-center text-xs font-bold ${
                    delta === null ? "text-gray-300" :
                    delta > 0 ? "text-red-600" :
                    delta < 0 ? "text-green-600" : "text-gray-500"
                  }`}>
                    {delta === null ? "—" : delta > 0 ? `+${delta}` : delta}
                  </span>
                </div>
              );
            })}
          </div>
          {sub.storyPointsJustification && (
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Justificativa do comparativo</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{sub.storyPointsJustification}</p>
            </div>
          )}
        </div>
      )}

      {/* Matriz MoSCoW */}
      {sub.moscowMatrix && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Matriz MoSCoW</h3>
          {surpriseReqs.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
              <span className="font-bold text-amber-500">★</span>
              Itens com ★ são dos novos requisitos do Fator Surpresa
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(["must", "should", "could", "wont"] as const).map((cat) => {
              const style = MOSCOW_STYLES[cat];
              const items = sub.moscowMatrix[cat] ?? [];
              return (
                <div key={cat} className={`rounded-xl border p-3 ${style.bg}`}>
                  <p className={`text-xs font-bold ${style.color} uppercase mb-2`}>{style.label}</p>
                  {items.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">—</p>
                  ) : (
                    <ul className="space-y-1">
                      {items.map((p) => (
                        <li key={p} className={`text-xs flex items-start gap-1 ${style.color}`}>
                          {surpriseReqs.includes(p)
                            ? <span className="shrink-0 font-bold text-amber-500">★</span>
                            : <span className="shrink-0 opacity-40">•</span>}
                          {p.split("(")[0].trim()}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
          {sub.moscowJustification && (
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Justificativa da priorização</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{sub.moscowJustification}</p>
            </div>
          )}
        </div>
      )}

      {/* Links */}
      <div className="flex flex-wrap gap-3">
        {sub.githubLink && (
          <a
            href={sub.githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Ver repositório GitHub
          </a>
        )}
        {sub.pdfUrl && (
          <a
            href={sub.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <FileText className="w-4 h-4" /> Abrir PDF de entrega
          </a>
        )}
        {!sub.githubLink && !sub.pdfUrl && (
          <p className="text-xs text-gray-400 italic">Repositório e PDF ainda não enviados.</p>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [students, setStudents] = useState<AppUser[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [permissionError, setPermissionError] = useState(false);
  const [surpriseActive, setSurpriseActive] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [surpriseExpanded, setSurpriseExpanded] = useState(false);
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());

  const [messages, setMessages] = useState<Record<string, string>>(DEFAULT_MESSAGES);
  const [requirementTexts, setRequirementTexts] = useState<Record<string, string>>(DEFAULT_REQUIREMENTS);

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "student"));
    return onSnapshot(
      q,
      async (snap) => {
        const users = snap.docs.map((d) => d.data() as AppUser);
        setStudents(users);
        const subs: Record<string, Submission> = {};
        let hasPermissionError = false;
        await Promise.all(
          users.map(async (u) => {
            try {
              const sub = await getSubmissionByUid(u.uid);
              if (sub) subs[u.uid] = sub;
            } catch (err: unknown) {
              const code = (err as { code?: string }).code;
              if (code === "permission-denied") hasPermissionError = true;
              console.warn("[admin] submission fetch error for", u.uid, code);
            }
          })
        );
        setPermissionError(hasPermissionError);
        setSubmissions({ ...subs });
      },
      (error) => console.warn("[admin] students onSnapshot error:", error.code)
    );
  }, []);

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
          .split("\n").map((s) => s.trim()).filter(Boolean);
      }
      await triggerSurprise(messages, requirements);
    } finally {
      setTriggering(false);
    }
  }

  function toggleStudent(uid: string) {
    setExpandedStudents((prev) => {
      const next = new Set(prev);
      next.has(uid) ? next.delete(uid) : next.add(uid);
      return next;
    });
  }

  const totalSP = (points: Record<string, number>) =>
    Object.values(points).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
        <p className="text-gray-500 mt-1">Acompanhe o progresso dos grupos em tempo real.</p>
      </div>

      {permissionError && (
        <div className="bg-red-50 border border-red-300 rounded-2xl px-5 py-4 space-y-1">
          <p className="font-bold text-red-700 text-sm">⚠️ Permissão negada ao ler submissões dos alunos</p>
          <p className="text-red-600 text-sm">
            As regras do Firestore ainda não foram publicadas. Publique o arquivo{" "}
            <code className="bg-red-100 px-1 rounded">firestore.rules</code> no Firebase Console
            ou rode <code className="bg-red-100 px-1 rounded">npx firebase deploy --only firestore:rules</code>{" "}
            no terminal.
          </p>
        </div>
      )}

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
                onClick={() => setSurpriseExpanded((v) => !v)}
                className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors"
              >
                {surpriseExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {surpriseExpanded ? "Fechar" : "Configurar"}
              </button>
            )}
          </div>
        </div>

        {!surpriseActive && surpriseExpanded && (
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
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-400 text-xs">Novos requisitos MoSCoW <span className="text-gray-600">(um por linha)</span></label>
                    <textarea
                      value={requirementTexts[repo.id]}
                      onChange={(e) => setRequirementTexts((r) => ({ ...r, [repo.id]: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm resize-none"
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
              const isOpen = expandedStudents.has(student.uid);
              return (
                <div key={student.uid}>
                  {/* Linha do aluno */}
                  <button
                    onClick={() => toggleStudent(student.uid)}
                    className="w-full px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {student.groupMembers?.join(", ") || student.email}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Repo #{student.assignedRepoId} — {REPO_NAMES[student.assignedRepoId ?? 1]}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      {sub?.initialStoryPoints && Object.keys(sub.initialStoryPoints).length > 0 && (
                        <span className="text-gray-500 text-xs">
                          SP: <strong>{totalSP(sub.initialStoryPoints)}</strong>
                          {" → "}
                          <strong className="text-blue-700">{totalSP(sub.finalStoryPoints ?? {})}</strong>
                        </span>
                      )}
                      {sub?.moscowMatrix?.must?.length > 0 && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">MoSCoW ✓</span>
                      )}
                      {sub?.surpriseAcknowledged ? (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Ciente ✓</span>
                      ) : surpriseActive ? (
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full animate-pulse">Pendente</span>
                      ) : null}
                      {sub?.submittedAt && (
                        <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">Entregue ✓</span>
                      )}
                      {!sub && (
                        <span className="text-gray-400 text-xs">Sem progresso</span>
                      )}
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  {/* Painel de detalhes */}
                  {isOpen && (
                    sub ? (
                      <SubmissionDetail sub={sub} />
                    ) : (
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                        <p className="text-sm text-gray-400 italic">Este aluno ainda não iniciou nenhuma fase.</p>
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
