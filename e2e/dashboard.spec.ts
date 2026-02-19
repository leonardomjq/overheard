import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("loads with dark theme and correct content", async ({ page }) => {
    await page.goto("/");

    // Check dark theme
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);

    // Check branding
    await expect(page.getByText("ScoutAgent")).toBeVisible();
    await expect(
      page.getByText("Venture Intelligence")
    ).toBeVisible();

    // Check navigation links
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Get Started" })
    ).toBeVisible();
  });

  test("feature grid displays three features", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Signal Detection")).toBeVisible();
    await expect(page.getByText("Pattern Matching")).toBeVisible();
    await expect(page.getByText("Alpha Cards")).toBeVisible();
  });
});

test.describe("Auth Pages", () => {
  test("login page renders form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign in" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Start free" })).toBeVisible();
  });

  test("signup page renders form", async ({ page }) => {
    await page.goto("/signup");

    await expect(page.getByText("Start discovering opportunities")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Start Free" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  });
});
