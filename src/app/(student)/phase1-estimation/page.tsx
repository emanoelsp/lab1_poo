"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useSubmission } from "@/hooks/useSubmission";
import { saveInitialStoryPoints } from "@/services/submissions.service";

const FIBONACCI = [1, 2, 3, 5, 8] as const;

const FEATURES_BY_REPO: Record<number, { id: string; name: string; description: string }[]> = {
  1: [
    { id: "F001", name: "Cadastro de Jogadores", description: "Registrar jogador com nome, posição e time." },
    { id: "F002", name: "Cadastro de Times", description: "Criar times com nome, cidade e capacidade." },
    { id: "F003", name: "Transferência de Jogadores", description: "Mover jogador de um time para outro." },
    { id: "F004", name: "Cálculo de Folha Salarial", description: "Somar salários de todos os jogadores de um time." },
    { id: "F005", name: "Sorteio de Partidas", description: "Gerar confrontos aleatórios entre times da liga." },
    { id: "F006", name: "Estatísticas da Temporada", description: "Calcular média de gols, aproveitamento e classificação." },
  ],
  2: [
    { id: "F001", name: "Cadastro de Materiais", description: "Registrar material com nome, quantidade e preço." },
    { id: "F002", name: "Cadastro de Obras", description: "Criar obra com endereço, prazo e orçamento." },
    { id: "F003", name: "Alocação de Materiais", description: "Associar materiais a uma obra específica." },
    { id: "F004", name: "Cancelamento de Obra", description: "Encerrar obra e devolver materiais ao estoque." },
    { id: "F005", name: "Cálculo de Custo Total", description: "Somar custo de todos os materiais de uma obra." },
    { id: "F006", name: "Verificação de Estoque Mínimo", description: "Alertar quando material estiver abaixo do mínimo." },
  ],
  3: [
    { id: "F001", name: "Cadastro de Cargas", description: "Registrar carga com tipo, peso e destino." },
    { id: "F002", name: "Cadastro de Caminhões", description: "Criar caminhão com placa e capacidade máxima." },
    { id: "F003", name: "Alocação de Carga", description: "Associar carga a um caminhão disponível." },
    { id: "F004", name: "Transição de Status", description: "Avançar estado da entrega: Aguardando → Em Trânsito → Concluída." },
    { id: "F005", name: "Cálculo de Rota Ótima", description: "Ordenar entregas por prioridade e capacidade." },
    { id: "F006", name: "Cancelamento de Entrega", description: "Cancelar entrega e liberar espaço no caminhão." },
  ],
};

export default function Phase1Page() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { submission, loading } = useSubmission(user?.uid);

  const repoId = (user?.assignedRepoId ?? 1) as 1 | 2 | 3;
  const features = FEATURES_BY_REPO[repoId] ?? FEATURES_BY_REPO[1];

  const [points, setPoints] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Restaura progresso salvo no Firestore
  useEffect(() => {
    if (!submission?.initialStoryPoints) return;
    const saved = submission.initialStoryPoints;
    if (Object.keys(saved).length > 0) setPoints(saved);
  }, [submission]);

  const allFilled = features.every((f) => points[f.id] !== undefined);

  async function handleSave() {
    if (!allFilled) {
      setError("Atribua Story Points a todas as funcionalidades antes de continuar.");
      return;
    }
    setSaving(true);
    try {
      if (!user?.uid) return;
      await saveInitialStoryPoints(user.uid, points);
      router.push("/phase4-moscow");
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
        <h1 className="text-2xl font-bold text-gray-900">Fase 2 — Estimativa de Story Points</h1>
        <p className="text-gray-500 mt-1">
          Você acabou de analisar o UML do projeto. Agora estime a complexidade de cada funcionalidade.
          Use o diagrama como referência — avalie a <strong>complexidade de implementação</strong>, não o tempo.
        </p>
      </div>

      {/* História do cliente */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <p className="text-xs font-bold text-amber-700 uppercase mb-2">História do Cliente</p>
        <p className="text-gray-800 leading-relaxed">
          {repoId === 1 && "Você foi contratado para resgatar o sistema de Gestão de Ligas Esportivas de uma empresa que faliu. O sistema gerencia times, jogadores e partidas. A equipe anterior foi demitida após múltiplos bugs em produção. Você deve auditar o código, identificar os problemas e entregar uma versão refatorada."}
          {repoId === 2 && "Você assumiu o sistema de Gestão de Obras de uma construtora que demitiu a equipe de TI. O sistema controla materiais, obras em andamento e custos. Foram reportados bugs graves na gestão de estoque ao cancelar obras. Sua missão é auditar e refatorar."}
          {repoId === 3 && "Você herdou o sistema de Logística e Roteamento de uma transportadora. O sistema gerencia caminhões, cargas e rotas de entrega. Foram reportados bugs de transição de estado e cálculo de rota. Você deve identificar os code smells e propor a refatoração correta."}
        </p>
      </div>

      {/* Tabela de Story Points */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-0 bg-gray-50 border-b border-gray-200 px-6 py-3">
          <span className="col-span-1 text-xs font-bold text-gray-500">ID</span>
          <span className="col-span-4 text-xs font-bold text-gray-500">Funcionalidade</span>
          <span className="col-span-3 text-xs font-bold text-gray-500">Descrição</span>
          <span className="col-span-4 text-xs font-bold text-gray-500 text-center">Story Points</span>
        </div>
        {features.map((feature) => {
          const selected = points[feature.id];
          const isHigh = selected === 8;
          return (
            <div key={feature.id} className={`border-b border-gray-100 last:border-0 transition-colors ${isHigh ? "bg-amber-50" : ""}`}>
              <div className="grid grid-cols-12 gap-0 px-6 py-4 items-center">
                <span className="col-span-1 text-sm font-mono text-gray-400">{feature.id}</span>
                <span className="col-span-4 text-sm font-medium text-gray-800">{feature.name}</span>
                <span className="col-span-3 text-xs text-gray-500">{feature.description}</span>
                <div className="col-span-4 flex flex-wrap gap-1 justify-center">
                  {FIBONACCI.map((n) => (
                    <button
                      key={n}
                      onClick={() => setPoints((prev) => ({ ...prev, [feature.id]: n }))}
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                        selected === n
                          ? n === 8
                            ? "bg-amber-500 text-white shadow-md scale-110"
                            : "bg-blue-600 text-white shadow-md scale-110"
                          : "bg-gray-100 text-gray-700 hover:bg-blue-50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              {isHigh && (
                <div className="px-6 pb-3">
                  <p className="text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-2">
                    ⚠️ <strong>Complexidade alta:</strong> considere dividir esta funcionalidade em tarefas menores antes de prosseguir.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {Object.values(points).some((v) => v === 8) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
          🧩 <strong>Uma ou mais funcionalidades estão com complexidade máxima (8 SP).</strong> No mundo real, isso dispararia uma conversa de refinamento para decompor o item em histórias menores. Aqui, reflita: o que torna essa funcionalidade tão complexa? Dependências ocultas? Code smells esperados?
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
      )}

      <div className="flex justify-between items-center">
        <a
          href="/phase2-uml"
          className="px-6 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors min-h-[48px] flex items-center"
        >
          ← Voltar
        </a>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500">
            {Object.keys(points).length} / {features.length} preenchidos
          </p>
          <button
            onClick={handleSave}
            disabled={!allFilled || saving}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors min-h-[48px]"
          >
            {saving ? "Salvando..." : "Salvar e Avançar →"}
          </button>
        </div>
      </div>
    </div>
  );
}
