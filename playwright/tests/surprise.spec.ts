import { test, expect } from "@playwright/test";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const STUDENT_EMAIL = process.env.TEST_STUDENT_EMAIL ?? "student@test.com";
const STUDENT_PASSWORD = process.env.TEST_STUDENT_PASSWORD ?? "test123456";

test.describe("Fator Surpresa", () => {
  test("modal não fecha sem digitar CIENTE", async ({ page }) => {
    // Login como aluno
    await page.goto("/login");
    await page.fill('input[type="email"]', STUDENT_EMAIL);
    await page.fill('input[type="password"]', STUDENT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(profile|onboarding|phase)/);

    // Simular ativação via Firestore
    const app = initializeApp(firebaseConfig, "test-surprise");
    const db = getFirestore(app);
    await setDoc(doc(db, "admin_triggers", "surprise"), {
      isActive: true,
      message: "Teste de surpresa",
      activatedAt: new Date(),
    });

    // Aguardar modal aparecer (máx 2 segundos)
    await page.waitForSelector('[role="alertdialog"]', { timeout: 2000 });

    // Botão deve estar desabilitado
    const btn = page.getByRole("button", { name: /Confirmar/i });
    await expect(btn).toBeDisabled();

    // Digitar valor errado
    await page.fill('input[aria-label*="CIENTE"]', "ciente");
    await expect(btn).toBeDisabled();

    // Digitar valor correto
    await page.fill('input[aria-label*="CIENTE"]', "CIENTE");
    await expect(btn).toBeEnabled();

    // Limpar Firestore após teste
    await setDoc(doc(db, "admin_triggers", "surprise"), {
      isActive: false,
      message: "",
      activatedAt: new Date(),
    });
  });
});
