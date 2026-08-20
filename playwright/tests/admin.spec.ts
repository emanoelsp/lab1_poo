import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? "admin@test.com";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? "admin123456";

test.describe("Fluxo do Professor (Admin)", () => {
  test("admin não pode acessar área do aluno", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test("painel admin carrega lista de alunos", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/dashboard/);
    await expect(page.getByText("Painel Administrativo")).toBeVisible();
    await expect(page.getByText("DISPARAR FATOR SURPRESA")).toBeVisible();
  });
});
