"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { Copy, ExternalLink, CheckCircle } from "lucide-react";

const REPOS: Record<number, { name: string; url: string; domain: string }> = {
  1: {
    name: "Gestão de Ligas Esportivas",
    url: "https://github.com/emanoelsp/lab1_poo1.git",
    domain: "Times, Jogadores, Partidas e Estatísticas",
  },
  2: {
    name: "Gestão de Obras e Empreendimentos",
    url: "https://github.com/emanoelsp/lab1_poo2",
    domain: "Materiais, Obras, Sobrados e Orçamentos",
  },
  3: {
    name: "Logística e Roteamento",
    url: "https://github.com/emanoelsp/lab1_poo3",
    domain: "Cargas, Caminhões, Rotas e Entregas",
  },
};

export default function Phase3Page() {
  const { user } = useAuthStore();
  const repoId = (user?.assignedRepoId ?? 1) as 1 | 2 | 3;
  const repo = REPOS[repoId];
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(repo.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fase 4 — Seu Repositório</h1>
        <p className="text-gray-500 mt-1">
          Você já priorizou o que vai corrigir. Agora clone o repositório e execute as correções Must Have.
        </p>
      </div>

      {/* Card do repositório */}
      <div className="bg-white rounded-2xl border-2 border-blue-200 p-8 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase">Repositório #{repoId}</span>
            <h2 className="text-xl font-bold text-gray-900 mt-1">{repo.name}</h2>
            <p className="text-sm text-gray-500 mt-1">Domínio: {repo.domain}</p>
          </div>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
            Sorteado para seu grupo
          </span>
        </div>

        <div className="bg-gray-900 rounded-xl p-4 flex items-center justify-between gap-4">
          <code className="text-green-400 text-sm break-all">{repo.url}</code>
          <button
            onClick={handleCopy}
            aria-label="Copiar link do repositório"
            className="shrink-0 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            {copied ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <Copy className="w-5 h-5 text-gray-300" />
            )}
          </button>
        </div>

        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir no GitHub
        </a>
      </div>

      {/* Instruções */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-bold text-gray-800">Como clonar e executar</h3>
        <div className="bg-gray-900 rounded-xl p-4 space-y-2 font-mono text-sm">
          <p className="text-green-400"># 1. Clone o repositório</p>
          <p className="text-white">git clone {repo.url}</p>
          <p className="text-green-400 mt-2"># 2. Entre na pasta</p>
          <p className="text-white">cd &lt;nome-da-pasta&gt;</p>
          <p className="text-green-400 mt-2"># 3. Compile os arquivos Java</p>
          <p className="text-white">javac -d bin src/*.java</p>
          <p className="text-green-400 mt-2"># 4. Execute o sistema</p>
          <p className="text-white">java -cp bin Main</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Importante:</strong> O código compila sem erros, mas falha em regras de negócio. Sua missão é encontrar os bugs lógicos e os code smells, não apenas os erros de compilação.
        </p>
      </div>

      {/* Alerta: documentar durante a edição */}
      <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl px-6 py-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📸</span>
          <p className="font-black text-amber-800 uppercase tracking-wide text-sm">
            Documente cada alteração no momento em que fizer
          </p>
        </div>
        <p className="text-sm text-amber-700 leading-relaxed">
          Antes de editar qualquer arquivo, tire um <strong>print do trecho original</strong> com o problema destacado.
          Após corrigir, tire o <strong>print do novo código</strong>. Não deixe para documentar depois —
          você não vai lembrar como estava antes.
        </p>
        <div className="bg-amber-100 rounded-xl px-4 py-3 border border-amber-300">
          <p className="text-sm font-bold text-amber-900">
            Regra prática: abriu o arquivo → print antes. Terminou a correção → print depois. Só então avance.
          </p>
        </div>
      </div>

      {/* Chamada para a próxima etapa */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl px-6 py-5 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          <p className="font-bold text-blue-800 text-base">Próximo passo: Entrega Final</p>
        </div>
        <p className="text-sm text-blue-700 leading-relaxed">
          Com as correções feitas, avance para a <strong>Entrega Final</strong>. Você vai informar o link do
          repositório refatorado, confirmar os Story Points finais e enviar o PDF de documentação.
        </p>
      </div>

      <div className="flex justify-between">
        <Link href="/phase4-moscow" className="px-6 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors min-h-[48px] flex items-center">
          ← Voltar
        </Link>
        <Link href="/phase5-delivery" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors min-h-[48px] flex items-center">
          Próximo: Entrega →
        </Link>
      </div>
    </div>
  );
}
