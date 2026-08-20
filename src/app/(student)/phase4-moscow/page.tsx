"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { useSubmission } from "@/hooks/useSubmission";
import { saveMoscow } from "@/services/submissions.service";
import type { MoscowMatrix } from "@/types/submission.types";

const PROBLEMS_BY_REPO: Record<1 | 2 | 3, string[]> = {
  1: [
    "God Class em Liga.java — concentra cadastro, transferência, folha salarial, partidas e estatísticas (viola SRP)",
    "Feature Envy em Liga.calcularFolhaSalarial() — percorre e soma dados de Jogador em vez de delegar para a própria classe",
    "Long Parameter List em Partida() — construtor recebe 7 parâmetros primitivos (timeAId, timeBId, data, gols, local, arbitroId…)",
    "Data Class em Jogador.java — apenas getters/setters, zero comportamento próprio, depende da Liga para tudo",
    "Erro de Associação em Liga.transferirJogador() — adiciona jogador ao novo time mas não o remove do time de origem",
    "Data Class em Time.java — sem comportamento próprio, não valida capacidade nem calcula nada por si mesmo",
    "Long Method em Liga.gerarClassificacao() — loops aninhados calculando pontos, saldo e aproveitamento em um único método",
    "Força bruta em Liga.buscarJogador() — percorre lista com if/else em vez de delegar busca ao próprio Time",
  ],
  2: [
    "God Class em GestorObras.java — centraliza cadastro, alocação, cancelamento, custo e relatório (viola SRP)",
    "Feature Envy em GestorObras.calcularCustoObra() — soma preço × quantidade de cada Material em vez de delegar ao próprio Material",
    "Long Parameter List em Obra() — construtor recebe 6+ parâmetros primitivos (endereço, prazo, orçamento, status…)",
    "Data Class em Material.java — apenas getters/setters, não calcula custo nem valida estoque por conta própria",
    "Bug de Agregação em GestorObras.cancelarObra() — retorna sempre 1 em vez do tamanho real de materiaisIds liberados",
    "Primitive Obsession em Obra.status — usa String livre (\"ativo\", \"cancelada\") em vez de objeto com comportamento e validação",
    "Long Method em GestorObras.gerarRelatorio() — loops aninhados misturando filtragem, formatação e cálculos em um único método",
    "Força bruta em GestorObras.atualizarStatus() — aceita qualquer String sem validar estados permitidos",
  ],
  3: [
    "God Class em SistemaLogistica.java — centraliza cadastro de caminhões, cargas, rotas e entregas (viola SRP)",
    "Feature Envy em SistemaLogistica.calcularRotaOtima() — acessa capacidade de Caminhao e peso de Carga diretamente em vez de delegar",
    "Long Parameter List em Entrega() — construtor recebe 5 parâmetros primitivos (id, caminhaoId, cargaId, dataEntrega, observacoes)",
    "Data Class em Carga.java — apenas getters/setters, não calcula peso nem gerencia seu próprio status",
    "Bug de Associação em SistemaLogistica.cancelarEntrega() — muda status da carga mas não remove cargaId da lista do caminhão",
    "Primitive Obsession em Carga.status — usa String livre (\"aguardando\", \"em_transito\") em vez de objeto com transições validadas",
    "Long Method em SistemaLogistica.buscarCaminhaoDisponivel() — loops aninhados comparando capacidade e carga atual sem delegação",
    "Data Class em Caminhao.java — sem comportamento próprio, não sabe calcular carga atual nem verificar disponibilidade",
  ],
};

type Category = keyof MoscowMatrix;
const CATEGORIES: { key: Category; label: string; color: string; bg: string; active: string }[] = [
  { key: "must",   label: "Must Have",   color: "text-red-800",    bg: "bg-red-50 border-red-300",      active: "bg-red-100 border-red-600 text-red-900" },
  { key: "should", label: "Should Have", color: "text-orange-800", bg: "bg-orange-50 border-orange-300", active: "bg-orange-100 border-orange-600 text-orange-900" },
  { key: "could",  label: "Could Have",  color: "text-yellow-800", bg: "bg-yellow-50 border-yellow-300", active: "bg-yellow-100 border-yellow-600 text-yellow-900" },
  { key: "wont",   label: "Won't Have",  color: "text-slate-800",  bg: "bg-slate-200 border-slate-400",  active: "bg-slate-400 border-slate-700 text-slate-900" },
];

export default function Phase4Page() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { submission, loading } = useSubmission(user?.uid);

  const repoId = ((user?.assignedRepoId ?? 1) as 1 | 2 | 3);
  const baseProblems = PROBLEMS_BY_REPO[repoId] ?? PROBLEMS_BY_REPO[1];

  const [matrix, setMatrix] = useState<MoscowMatrix>({ must: [], should: [], could: [], wont: [] });
  const [justification, setJustification] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Pré-popula a partir do Firestore quando o submission carrega
  useEffect(() => {
    if (!submission) return;
    if (submission.moscowMatrix) {
      const m = submission.moscowMatrix;
      const hasData = Object.values(m).some((arr) => arr.length > 0);
      if (hasData) setMatrix(m);
    }
    if (submission.moscowJustification) {
      setJustification(submission.moscowJustification);
    }
  }, [submission]);

  const surpriseRequirements: string[] = submission?.surpriseRequirements ?? [];
  const allProblems = [...baseProblems, ...surpriseRequirements];

  const categorized = new Set(Object.values(matrix).flat());
  const allCategorized = allProblems.every((p) => categorized.has(p));

  function assignProblem(problem: string, category: Category) {
    setMatrix((prev) => {
      const next = { ...prev };
      (Object.keys(next) as Category[]).forEach((k) => {
        next[k] = next[k].filter((p) => p !== problem);
      });
      next[category] = [...next[category], problem];
      return next;
    });
  }

  function getProblemCategory(problem: string): Category | null {
    for (const cat of Object.keys(matrix) as Category[]) {
      if (matrix[cat].includes(problem)) return cat;
    }
    return null;
  }

  async function handleSave() {
    if (!allCategorized) {
      setError("Classifique todos os problemas antes de continuar.");
      return;
    }
    if (justification.trim().length < 100) {
      setError("A justificativa deve ter ao menos 100 caracteres.");
      return;
    }
    setSaving(true);
    try {
      if (!user?.uid) return;
      await saveMoscow(user.uid, matrix, justification);
      router.push("/phase5-delivery");
    } catch {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fase 4 — Matriz MoSCoW</h1>
        <p className="text-gray-500 mt-1">
          Priorize os problemas encontrados. Você não terá tempo de corrigir tudo — escolha com critério.
        </p>
      </div>

      {/* Banner de novos requisitos do cliente */}
      {surpriseRequirements.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚨</span>
            <p className="font-bold text-amber-800">Novos requisitos do cliente — classifique abaixo</p>
          </div>
          <ul className="space-y-1">
            {surpriseRequirements.map((req, i) => (
              <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                <span className="font-bold text-amber-500 shrink-0">★</span>
                {req}
              </li>
            ))}
          </ul>
          <p className="text-xs text-amber-600">
            Esses itens foram adicionados pelo Fator Surpresa e devem ser priorizados junto com os demais.
          </p>
        </div>
      )}

      {/* Lista de problemas */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
          Problemas encontrados — selecione a categoria:
        </h3>

        {/* Problemas base */}
        {baseProblems.map((problem) => {
          const current = getProblemCategory(problem);
          return (
            <div
              key={problem}
              className="flex flex-col sm:flex-row sm:items-center gap-2 py-2 border-b border-gray-100 last:border-0"
            >
              <span className="text-sm text-gray-700 flex-1">{problem}</span>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => assignProblem(problem, cat.key)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all min-h-[36px] ${
                      current === cat.key
                        ? `${cat.active} border-2 font-bold shadow-sm`
                        : "bg-gray-100 border border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {/* Novos requisitos da surpresa — destacados */}
        {surpriseRequirements.length > 0 && (
          <>
            <div className="pt-2 pb-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                🚨 NOVOS — Requisitos do Cliente (Fator Surpresa)
              </span>
            </div>
            {surpriseRequirements.map((req) => {
              const current = getProblemCategory(req);
              return (
                <div
                  key={req}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 py-3 px-3 rounded-xl border-2 border-amber-300 bg-amber-50"
                >
                  <span className="text-sm font-semibold text-amber-900 flex-1 flex items-start gap-2">
                    <span className="text-amber-500 shrink-0 font-bold">★</span>
                    {req}
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => assignProblem(req, cat.key)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all min-h-[36px] ${
                          current === cat.key
                            ? `${cat.bg} ${cat.color} border-current font-bold`
                            : "bg-gray-100 border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Resumo da matriz */}
      {allCategorized && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <div key={cat.key} className={`rounded-xl border-2 p-4 ${cat.bg}`}>
              <p className={`text-xs font-bold ${cat.color} mb-2`}>{cat.label}</p>
              <ul className="space-y-1">
                {matrix[cat.key].map((p) => {
                  const isSurprise = surpriseRequirements.includes(p);
                  return (
                    <li key={p} className={`text-xs ${cat.color} flex items-start gap-1`}>
                      {isSurprise && <span className="shrink-0 font-bold text-amber-500">★</span>}
                      {p.split("(")[0].trim()}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Justificativa */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
        <label className="block font-bold text-gray-800">Justificativa da priorização *</label>
        <p className="text-sm text-gray-500">
          Explique por que priorizou certos problemas sobre outros, incluindo os novos requisitos do cliente se aplicável.
          (mínimo 100 caracteres)
        </p>
        <textarea
          value={justification}
          onChange={(e) => {
            setJustification(e.target.value);
            setError("");
          }}
          onBlur={() => {
            if (justification.length > 0 && justification.length < 100) {
              setError(`Justificativa muito curta. ${100 - justification.length} caracteres restantes.`);
            }
          }}
          rows={5}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          placeholder="Ex: Priorizei a God Class como Must Have porque ela é a raiz de todos os outros problemas. O novo requisito do cliente foi classificado como Must Have pois impacta diretamente a confiabilidade do sistema..."
        />
        <p className="text-xs text-gray-400 text-right">{justification.length} / 100 mínimo</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
      )}

      <div className="flex justify-between">
        <Link
          href="/phase3-repository"
          className="px-6 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors min-h-[48px] flex items-center"
        >
          ← Voltar
        </Link>
        <button
          onClick={handleSave}
          disabled={!allCategorized || justification.length < 100 || saving}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors min-h-[48px]"
        >
          {saving ? "Salvando..." : "Salvar e Avançar →"}
        </button>
      </div>
    </div>
  );
}
