import { test, expect } from "@playwright/test";

// Credenciais de teste — use um aluno de teste no Firebase
const STUDENT_EMAIL = process.env.TEST_STUDENT_EMAIL ?? "student@test.com";
const STUDENT_PASSWORD = process.env.TEST_STUDENT_PASSWORD ?? "test123456";

test.describe("Fluxo do Aluno", () => {
  test("deve redirecionar para login quando não autenticado", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/login/);
  });

  test("deve mostrar erro com credenciais inválidas", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "errado@email.com");
    await page.fill('input[type="password"]', "senhaerrada");
    await page.click('button[type="submit"]');
    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("deve fazer login e redirecionar corretamente", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', STUDENT_EMAIL);
    await page.fill('input[type="password"]', STUDENT_PASSWORD);
    await page.click('button[type="submit"]');
    // Deve ir para /profile (novo) ou /onboarding (já com perfil)
    await expect(page).toHaveURL(/\/(profile|onboarding)/);
  });

  test("repositório sorteado persiste após refresh", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', STUDENT_EMAIL);
    await page.fill('input[type="password"]', STUDENT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(profile|onboarding|phase)/);

    await page.goto("/phase3-repository");
    const url1 = await page.locator("code").first().textContent();
    await page.reload();
    const url2 = await page.locator("code").first().textContent();
    expect(url1).toBe(url2);
  });
});
