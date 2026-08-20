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

// Beep de alarme via Web Audio API (sem arquivo de áudio)
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

// Notificação nativa do OS — funciona com navegador minimizado
function sendOsNotification() {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    const n = new Notification("🚨 FATOR SURPRESA — Ação Imediata!", {
      body: "O cliente enviou uma mudança urgente. Abra o sistema AGORA!",
      icon: "/favicon.ico",
      requireInteraction: true,
      tag: "fator-surpresa",
    });
    n.onclick = () => { window.focus(); n.close(); };
  } catch {
    // Bloqueado pelo browser — silencioso
  }
}

// Muda o favicon para 🚨 usando canvas
let originalFaviconHref: string | null = null;

function setWarningFavicon() {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.font = "28px serif";
    ctx.fillText("🚨", 0, 26);
    let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "shortcut icon";
      document.head.appendChild(link);
    }
    if (!originalFaviconHref) originalFaviconHref = link.href;
    link.href = canvas.toDataURL();
  } catch {
    // Canvas indisponível — silencioso
  }
}

function restoreFavicon() {
  try {
    const link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
    if (link && originalFaviconHref) link.href = originalFaviconHref;
  } catch {
    // Silencioso
  }
}

export function useSurprise() {
  const { setSurprise } = useSurpriseStore();
  const prevActiveRef = useRef(false);
  const flashIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notifIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Alarme de áudio repetido a cada 6 s enquanto o modal estiver ativo
  function startAudioLoop() {
    if (audioIntervalRef.current) return;
    audioIntervalRef.current = setInterval(() => {
      playAlertBeep();
    }, 6000);
  }

  function stopAudioLoop() {
    if (!audioIntervalRef.current) return;
    clearInterval(audioIntervalRef.current);
    audioIntervalRef.current = null;
  }

  // Reenvia a notificação OS a cada 60 s para forçar aparição no tray
  function startNotifLoop() {
    if (notifIntervalRef.current) return;
    notifIntervalRef.current = setInterval(() => {
      sendOsNotification();
    }, 60_000);
  }

  function stopNotifLoop() {
    if (!notifIntervalRef.current) return;
    clearInterval(notifIntervalRef.current);
    notifIntervalRef.current = null;
  }

  function startAlerts() {
    playAlertBeep();
    startTitleFlash();
    setWarningFavicon();
    sendOsNotification();
    startAudioLoop();
    startNotifLoop();
  }

  function stopAlerts() {
    stopTitleFlash();
    stopAudioLoop();
    stopNotifLoop();
    restoreFavicon();
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
            startAlerts();
          }

          if (!newIsActive && prevActiveRef.current) {
            stopAlerts();
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
      stopAlerts();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSurprise]);
}
