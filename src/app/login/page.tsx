"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp, signInWithGoogle, getAuthErrorMessage } from "@/lib/auth";
import { getUserById, ensureUserDocument } from "@/services/users.service";

type Mode = "login" | "register";

function setSession() {
  document.cookie = "pbl_session=1; path=/; max-age=86400";
}

async function redirectAfterAuth(uid: string, router: ReturnType<typeof useRouter>) {
  const user = await getUserById(uid);
  if (user?.role === "admin") {
    router.push("/admin/dashboard");
  } else if (!user?.profileCompleted) {
    router.push("/profile");
  } else {
    router.push("/onboarding");
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        if (name.trim().length < 2) {
          setError("Informe seu nome completo.");
          return;
        }
        const credential = await signUp(name.trim(), email, password);
        await ensureUserDocument(credential.user.uid, email, name.trim());
        setSession();
        router.push("/profile");
      } else {
        const credential = await signIn(email, password);
        setSession();
        await redirectAfterAuth(credential.user.uid, router);
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(getAuthErrorMessage(code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);

    try {
      const credential = await signInWithGoogle();
      const { uid, email: gEmail, displayName } = credential.user;
      await ensureUserDocument(uid, gEmail ?? "", displayName ?? "");
      setSession();
      await redirectAfterAuth(uid, router);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(getAuthErrorMessage(code));
    } finally {
      setGoogleLoading(false);
    }
  }

  const busy = loading || googleLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* Cabeçalho */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">POO Essential Academy</h1>
            <p className="text-sm text-gray-500 mt-1">Resgate de Projeto — PBL</p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={busy}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors min-h-[48px] font-medium text-gray-700 text-sm"
          >
            {googleLoading ? (
              <span className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Entrar com Google
          </button>

          {/* Divisor */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">ou</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Tabs login / criar conta */}
          <div className="flex rounded-lg border border-gray-200 p-1 mb-5">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  mode === m
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {m === "login" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          {/* Formulário */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[48px]"
                  placeholder="Seu nome"
                  disabled={busy}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setError("")}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[48px]"
                placeholder="seu@email.com"
                disabled={busy}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[48px]"
                placeholder="••••••••"
                disabled={busy}
              />
              {mode === "register" && (
                <p className="text-xs text-gray-400 mt-1">Mínimo 6 caracteres</p>
              )}
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors min-h-[48px]"
            >
              {loading
                ? mode === "register" ? "Criando conta..." : "Entrando..."
                : mode === "register" ? "Criar conta" : "Entrar"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            {mode === "login"
              ? "Alunos do POO Essential Academy podem entrar com as mesmas credenciais."
              : "Após criar a conta, complete seu perfil de grupo."}
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}
