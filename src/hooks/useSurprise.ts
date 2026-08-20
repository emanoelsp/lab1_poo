"use client";

import { useEffect, useRef } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSurpriseStore } from "@/stores/surprise.store";

async function ensureSurpriseDoc() {
  try {
    await setDoc(
      doc(db, "admin_triggers", "surprise"),
      { isActive: false, messages: {}, requirements: {}, activatedAt: null },
      { merge: true }
    );
  } catch {
    // Sem permissão de escrita — onSnapshot vai tratar
  }
}

// Beep de 3 notas via Web Audio API (sem arquivo de áudio)
function playAlertBeep() {
  try {
    const ctx = new AudioContext();
    const schedule = (freq: number, delay: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.28);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.3);
    };
    schedule(880, 0);
    schedule(660, 0.32);
    schedule(880, 0.64);
  } catch {
    // AudioContext indisponível — silencioso
  }
}

// Notificação nativa do OS (funciona com navegador minimizado)
function sendOsNotification() {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    const n = new Notification("🚨 FATOR SURPRESA — Ação Imediata!", {
      body: "O cliente enviou uma mudança urgente. Abra o sistema agora!",
      icon: "/favicon.ico",
      requireInteraction: true, // não desaparece automaticamente
      tag: "fator-surpresa",    // evita duplicatas
    });
    // Clicar na notificação traz a aba para frente
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    // Notificação bloqueada — silencioso
  }
}

export function useSurprise() {
  const { setSurprise } = useSurpriseStore();
  const prevActiveRef = useRef(false);
  const flashIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startTitleFlash() {
    if (flashIntervalRef.current) return;
    const originalTitle = document.title;
    let toggle = false;
    flashIntervalRef.current = setInterval(() => {
      document.title = toggle ? originalTitle : "🚨 FATOR SURPRESA — ABRA O SISTEMA!";
      toggle = !toggle;
    }, 600);
  }

  function stopTitleFlash() {
    if (!flashIntervalRef.current) return;
    clearInterval(flashIntervalRef.current);
    flashIntervalRef.current = null;
    document.title = "PBL — Resgate de Projeto";
  }

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    ensureSurpriseDoc().then(() => {
      unsubscribe = onSnapshot(
        doc(db, "admin_triggers", "surprise"),
        (snap) => {
          if (!snap.exists()) return;
          const data = snap.data();
          const newIsActive = data.isActive ?? false;

          setSurprise(newIsActive, data.messages ?? {}, data.requirements ?? {});

          if (newIsActive && !prevActiveRef.current) {
            // Surpresa acabou de ser disparada — chama atenção
            playAlertBeep();
            startTitleFlash();
            sendOsNotification();
          }

          if (!newIsActive && prevActiveRef.current) {
            stopTitleFlash();
          }

          prevActiveRef.current = newIsActive;
        },
        (error) => {
          console.warn("[useSurprise] onSnapshot error:", error.code);
        }
      );
    });

    return () => {
      unsubscribe();
      stopTitleFlash();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSurprise]);
}
