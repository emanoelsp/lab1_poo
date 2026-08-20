"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useSubmission } from "@/hooks/useSubmission";
import { saveFinalStoryPoints, saveDeliveryDraft, finalizeSubmission } from "@/services/submissions.service";
import { uploadPdf } from "@/services/storage.service";
import { Upload, CheckCircle } from "lucide-react";

const FIBONACCI = [1, 2, 3, 5, 8] as const;

const MOSCOW_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  must:   { label: "Must Have",   color: "text-red-700",    bg: "bg-red-50 border-red-200" },
  should: { label: "Should Have", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  could:  { label: "Could Have",  color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
  wont:   { label: "Won't Have",  color: "text-slate-600",  bg: "bg-slate-100 border-slate-300" },
};

const GIT_STEPS = [
  {
    desc: "Clone o repositório legado da disciplina (se ainda não fez)",
    cmd: "git clone <URL_DO_REPO_DA_DISCIPLINA>",
  },
  {
    desc: "Dentro da pasta clonada, veja qual remote está configurado",
    cmd: "git remote -v",
  },
  {
    desc: "Remova o remote original e adicione o seu repositório criado no GitHub",
    cmd: "git remote remove origin\ngit remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git",
  },
  {
    desc: "Garanta que está na branch main",
    cmd: "git branch -m main",
  },
  {
    desc: "Empacote todas as suas alterações",
    cmd: "git add .",
  },
  {
    desc: 'Faça o commit com uma mensagem descritiva da refatoração',
    cmd: 'git commit -m "refatoracao: extracao de classes e correcao de code smells"',
  },
  {
    desc: "Envie o código para o seu repositório no GitHub",
    cmd: "git push -u origin main",
  },
] as const;

export default function Phase5Page() {
  const { user } = useAuthStore();
  const { submission, loading } = useSubmission(user?.uid);
  const [finalPoints, setFinalPoints] = useState<Record<string, number>>({});
  const [justification, setJustification] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Restaura estado do Firestore quando a submission carrega
  useEffect(() => {
    if (!submission) return;
    if (submission.finalStoryPoints && Object.keys(submission.finalStoryPoints).length > 0) {
      setFinalPoints(submission.finalStoryPoints);
    }
    if (submission.storyPointsJustification) setJustification(submission.storyPointsJustification);
    if (submission.githubLink) setGithubLink(submission.githubLink);
    if (submission.pdfUrl) setPdfUrl(submission.pdfUrl);
    if (submission.submittedAt) setSubmitted(true);
  }, [submission]);

  const initialPoints = submission?.initialStoryPoints ?? {};
  const features = Object.keys(initialPoints);

  const allFinalFilled = features.length > 0 && features.every((f) => finalPoints[f] !== undefined);
  const validJustification = justification.trim().length >= 20;
  const validGithub = githubLink.includes("github.com");
  const validPdf = pdfUrl !== "";
  const canSubmit = allFinalFilled && validJustification && validGithub && validPdf;

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;
    if (file.type !== "application/pdf") {
      setError("Envie apenas arquivos PDF.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const url = await uploadPdf(user.uid, file);
      setPdfUrl(url);
      setPdfName(file.name);
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : String(err);
      setError(`Erro no upload: ${detail}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit() {
    setShowValidation(true);
    if (!canSubmit || !user?.uid) return;
    setSubmitting(true);
    try {
      await saveFinalStoryPoints(user.uid, finalPoints);
      await finalizeSubmission(user.uid, {
        finalStoryPoints: finalPoints,
        storyPointsJustification: justification,
        githubLink,
        pdfUrl,
      });
      setSubmitted(true);
    } catch {
      setError("Erro ao finalizar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Atividade Entregue!</h1>
        <p className="text-gray-500 mt-2">Sua entrega foi registrada com sucesso. Bom trabalho!</p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fase 5 — Entrega e Retrospectiva</h1>
        <p className="text-gray-500 mt-1">Compare suas estimativas iniciais com a complexidade real encontrada no código.</p>
      </div>

      {/* Comparativo de Story Points */}
      <div className={`bg-white rounded-2xl border overflow-hidden ${showValidation && !allFinalFilled ? "border-red-400" : "border-gray-200"}`}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Comparativo de Story Points</h2>
          {showValidation && !allFinalFilled && (
            <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-lg">
              Preencha todos os Story Points finais
            </span>
          )}
        </div>
        <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 px-6 py-3 text-xs font-bold text-gray-500 uppercase">
          <span className="col-span-4">Funcionalidade</span>
          <span className="col-span-2 text-center">Inicial</span>
          <span className="col-span-4 text-center">Final (agora)</span>
          <span className="col-span-2 text-center">Δ Delta</span>
        </div>
        {features.map((featureId) => {
          const initial = initialPoints[featureId];
          const final = finalPoints[featureId];
          const delta = final !== undefined ? final - initial : null;
          return (
            <div key={featureId} className={`grid grid-cols-12 border-b border-gray-100 last:border-0 px-6 py-4 items-center ${showValidation && finalPoints[featureId] === undefined ? "bg-red-50" : ""}`}>
              <span className="col-span-4 text-sm font-medium text-gray-800">{featureId}</span>
              <span className="col-span-2 text-center text-sm font-bold text-gray-500">{initial}</span>
              <div className="col-span-4 flex gap-1 justify-center flex-wrap">
                {FIBONACCI.map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      const updated = { ...finalPoints, [featureId]: n };
                      setFinalPoints(updated);
                      if (user?.uid) saveFinalStoryPoints(user.uid, updated).catch(() => {});
                    }}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      finalPoints[featureId] === n
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <span className={`col-span-2 text-center text-sm font-bold ${
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

      {/* Justificativa do comparativo */}
      <div className={`bg-white rounded-2xl border p-6 space-y-3 ${showValidation && !validJustification ? "border-red-400" : "border-gray-200"}`}>
        <div className="flex items-center justify-between">
          <label className="block font-bold text-gray-800">Por que a complexidade real diferiu da estimada? *</label>
          {showValidation && !validJustification && (
            <span className="text-xs font-semibold text-red-600">Mínimo 20 caracteres</span>
          )}
        </div>
        <textarea
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          onBlur={() => {
            if (user?.uid && justification) saveDeliveryDraft(user.uid, { storyPointsJustification: justification }).catch(() => {});
          }}
          rows={4}
          className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none ${showValidation && !validJustification ? "border-red-400 bg-red-50" : "border-gray-300"}`}
          placeholder="Ex: A God Class escondia dependências que não eram visíveis no UML, tornando a refatoração muito mais complexa do que o esperado..."
        />
      </div>

      {/* Matriz MoSCoW somente leitura */}
      {submission?.moscowMatrix && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Sua Matriz MoSCoW (somente leitura)</h2>

          {/* Legenda novos requisitos */}
          {(submission.surpriseRequirements ?? []).length > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <span className="font-bold text-amber-500">★</span>
              Itens marcados com ★ são os novos requisitos adicionados pelo Fator Surpresa
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(["must", "should", "could", "wont"] as const).map((cat) => {
              const style = MOSCOW_STYLES[cat];
              return (
                <div key={cat} className={`rounded-xl border p-4 ${style.bg}`}>
                  <p className={`text-xs font-bold ${style.color} uppercase mb-2`}>{style.label}</p>
                  <ul className="space-y-1.5">
                    {submission.moscowMatrix[cat].map((p) => {
                      const isSurprise = (submission.surpriseRequirements ?? []).includes(p);
                      return (
                        <li key={p} className={`text-xs flex items-start gap-1 ${style.color}`}>
                          {isSurprise ? (
                            <span className="shrink-0 font-bold text-amber-500">★</span>
                          ) : (
                            <span className="shrink-0 opacity-50">•</span>
                          )}
                          <span className={isSurprise ? "text-amber-800 font-medium" : ""}>
                            {p.split("(")[0].trim()}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          {submission.moscowJustification && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Justificativa das prioridades</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{submission.moscowJustification}</p>
            </div>
          )}
        </div>
      )}

      {/* Fluxo Git — envio do código refatorado */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <span className="text-xl">🔧</span>
          <div>
            <h2 className="font-bold text-gray-900">Passo a passo: enviar seu código no GitHub</h2>
            <p className="text-sm text-gray-500 mt-0.5">Execute os comandos abaixo no terminal dentro da pasta do projeto.</p>
          </div>
        </div>
        <ol className="divide-y divide-gray-100">
          {GIT_STEPS.map(({ desc, cmd }, i) => (
            <li key={i} className="flex gap-4 px-6 py-4">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <div className="flex-1 space-y-2 min-w-0">
                <p className="text-sm font-medium text-gray-700">{desc}</p>
                <pre className="bg-gray-900 text-green-400 text-xs rounded-lg px-4 py-2.5 overflow-x-auto font-mono whitespace-pre leading-relaxed">
                  {cmd}
                </pre>
              </div>
            </li>
          ))}
        </ol>
        <div className="px-6 pb-5 pt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-gray-800">
              Cole aqui o link do seu repositório no GitHub após o push *
            </label>
            {showValidation && !validGithub && (
              <span className="text-xs font-semibold text-red-600 shrink-0 ml-2">Link do GitHub inválido</span>
            )}
          </div>
          <input
            type="url"
            value={githubLink}
            onChange={(e) => setGithubLink(e.target.value)}
            onBlur={() => {
              if (user?.uid && githubLink) saveDeliveryDraft(user.uid, { githubLink }).catch(() => {});
            }}
            className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[48px] ${showValidation && !validGithub ? "border-red-400 bg-red-50" : "border-gray-300"}`}
            placeholder="https://github.com/seu-usuario/seu-repo"
          />
        </div>
      </div>

      {/* Instruções do PDF */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-amber-200 flex items-center gap-3">
          <span className="text-xl">📄</span>
          <div>
            <h2 className="font-bold text-gray-900">Como montar o PDF de entrega</h2>
            <p className="text-sm text-gray-600 mt-0.5">
              O PDF documenta cada correção que você fez. Siga a ordem da sua Matriz MoSCoW.
            </p>
          </div>
        </div>
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm font-semibold text-gray-700">
            Para cada problema corrigido, inclua uma página (ou seção) com:
          </p>
          <div className="overflow-x-auto rounded-xl border border-amber-200">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-amber-100">
                  {["Tipo de Bug", "Classe afetada", "Descrição do problema", "Código errado (print)", "Código corrigido (print)"].map((h) => (
                    <th key={h} className="border-r border-amber-200 last:border-0 px-3 py-2.5 text-left text-xs font-bold text-gray-700 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="border-r border-amber-100 px-3 py-3 text-xs text-gray-600 align-top">
                    <span className="block font-semibold text-gray-700 mb-1">Um dos cinco:</span>
                    God Class<br />
                    Data Class<br />
                    Primitive Obsession<br />
                    Feature Envy<br />
                    Long Param List
                  </td>
                  <td className="border-r border-amber-100 px-3 py-3 text-xs text-gray-600 align-top">
                    Nome da classe (e método, se aplicável).<br />
                    <span className="text-gray-400 mt-1 block">Ex: <code className="bg-gray-100 px-1 rounded">Liga</code>, <code className="bg-gray-100 px-1 rounded">GestorObras.cancelarObra</code></span>
                  </td>
                  <td className="border-r border-amber-100 px-3 py-3 text-xs text-gray-600 align-top">
                    Explique o que está errado e por que isso viola as boas práticas de POO (SRP, associação, agregação etc.)
                  </td>
                  <td className="border-r border-amber-100 px-3 py-3 text-xs text-gray-600 align-top">
                    Print do trecho original com o problema destacado.
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-600 align-top">
                    Print do trecho após a refatoração.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex items-start gap-2 bg-amber-100 rounded-xl px-4 py-3">
            <span className="text-amber-600 font-bold text-sm shrink-0">⚠️</span>
            <p className="text-xs text-amber-800 font-medium">
              A ordem das correções no PDF deve seguir sua priorização MoSCoW:{" "}
              <strong>Must Have primeiro</strong>, depois Should Have, Could Have e Won&apos;t Have.
              Inclua somente as correções que você realmente implementou.
            </p>
          </div>
        </div>
      </div>

      {/* Upload PDF */}
      <div className={`bg-white rounded-2xl border p-6 space-y-4 ${showValidation && !validPdf ? "border-red-400" : "border-gray-200"}`}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Upload do PDF *</h2>
          {showValidation && !validPdf && (
            <span className="text-xs font-semibold text-red-600">PDF obrigatório</span>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          onChange={handlePdfUpload}
          className="hidden"
        />
        {pdfUrl ? (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <span className="text-sm text-green-700 font-medium">{pdfName} — enviado com sucesso</span>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-3 px-6 py-4 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl text-gray-500 hover:text-blue-600 transition-colors w-full justify-center min-h-[56px]"
          >
            <Upload className="w-5 h-5" />
            {uploading ? "Enviando PDF..." : "Clique para selecionar o PDF"}
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
      )}

      {/* Checklist de requisitos */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Requisitos para envio</p>
        {[
          { ok: allFinalFilled, label: "Story Points finais preenchidos para todas as funcionalidades" },
          { ok: validJustification, label: "Justificativa do comparativo (mínimo 20 caracteres)" },
          { ok: validGithub, label: "Link do repositório GitHub válido" },
          { ok: validPdf, label: "PDF de entrega enviado" },
        ].map(({ ok, label }) => (
          <div key={label} className="flex items-center gap-2.5">
            <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
              {ok ? "✓" : "✗"}
            </span>
            <span className={`text-sm ${ok ? "text-gray-600" : "text-red-600 font-medium"}`}>{label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <a
          href="/phase4-moscow"
          className="px-6 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors min-h-[48px] flex items-center"
        >
          ← Voltar
        </a>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`flex-1 sm:flex-none sm:min-w-[280px] py-4 font-bold text-lg rounded-xl transition-colors min-h-[56px] text-white ${
            canSubmit ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 hover:bg-gray-500"
          }`}
        >
          {submitting ? "Enviando..." : "✅ Finalizar e Enviar Atividade"}
        </button>
      </div>
    </div>
  );
}
