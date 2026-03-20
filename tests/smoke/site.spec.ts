import { expect, test, type Page } from "@playwright/test";

function trackBrowserIssues(page: Page) {
  const consoleErrors: string[] = [];
  const requestFailures: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText ?? "unknown error";
    const isAbortedMediaRequest =
      failure === "net::ERR_ABORTED" &&
      request.method() === "GET" &&
      /\.(mp4|mov|m4v|webm|mkv|avi)(?:$|[?#])/i.test(request.url());

    if (isAbortedMediaRequest) return;
    requestFailures.push(`${request.method()} ${request.url()} :: ${failure}`);
  });

  return () => {
    expect(consoleErrors, `Console errors:\n${consoleErrors.join("\n")}`).toEqual([]);
    expect(pageErrors, `Page errors:\n${pageErrors.join("\n")}`).toEqual([]);
    expect(requestFailures, `Request failures:\n${requestFailures.join("\n")}`).toEqual([]);
  };
}

test("desktop smoke flow covers modals, gallery, and R2 assets", async ({ page }) => {
  const assertNoBrowserIssues = trackBrowserIssues(page);

  await page.goto("/");
  await expect(page.getByRole("heading", { name: /tiago silva/i })).toBeVisible();
  await expect(page.getByText(/fullstack software engineer/i)).toBeVisible();

  const projectCard = page.getByRole("button", { name: /open details for help agent/i });
  await expect(projectCard).toBeVisible();
  await projectCard.focus();
  await projectCard.press("Enter");

  const projectDialog = page.getByRole("dialog", { name: /accessing: help_agent\.dat/i });
  const galleryTrigger = projectDialog
    .getByRole("button", { name: /open help agent gallery/i })
    .first();
  await expect(projectDialog).toBeVisible();
  await expect(projectDialog.getByRole("button", { name: /close help agent details/i })).toBeFocused();
  await galleryTrigger.click();

  const galleryDialog = page.getByRole("dialog", { name: /help agent/i });
  await expect(galleryDialog).toBeVisible();
  await expect(galleryDialog.getByRole("button", { name: /close help agent gallery/i })).toBeFocused();

  const r2Response = page.waitForResponse(
    (response) =>
      response.url().includes("curriculum-vitae-r2.tsilva.eu") &&
      response.ok()
  );

  await expect(galleryDialog.locator("img").first()).toBeVisible();
  await expect(galleryDialog.locator("img").first()).toHaveAttribute(
    "src",
    /curriculum-vitae-r2\.tsilva\.eu/
  );
  await r2Response;

  await page.keyboard.press("Escape");
  await expect(galleryDialog).toBeHidden();
  await expect(
    projectDialog.getByRole("button", { name: /close help agent details/i })
  ).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(projectDialog).toBeHidden();
  await expect(projectCard).toBeFocused();

  const browseAllButton = page.getByRole("button", { name: /browse all/i }).first();
  await browseAllButton.focus();
  await browseAllButton.press("Enter");

  const techBrowser = page.getByRole("dialog", { name: /tech_browser\.exe/i });
  await expect(techBrowser).toBeVisible();
  await expect(techBrowser.getByRole("textbox", { name: /search technologies/i })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(techBrowser).toBeHidden();
  await expect(browseAllButton).toBeFocused();

  assertNoBrowserIssues();
});

test("gallery falls back to inline video previews when thumbnails are unavailable", async ({ page }) => {
  const assertNoBrowserIssues = trackBrowserIssues(page);

  await page.route("**/*.thumb.webp", async (route) => {
    await route.fulfill({
      status: 404,
      contentType: "text/plain",
      body: "missing thumbnail",
    });
  });

  await page.goto("/");

  const projectCard = page.getByRole("button", { name: /open details for help agent/i });
  await expect(projectCard).toBeVisible();
  await projectCard.click();

  const projectDialog = page.getByRole("dialog", { name: /accessing: help_agent\.dat/i });
  await expect(projectDialog).toBeVisible();
  await projectDialog.getByRole("button", { name: /open help agent gallery/i }).click();

  const galleryDialog = page.getByRole("dialog", { name: /help agent/i });
  await expect(galleryDialog).toBeVisible();

  const videoTile = galleryDialog.locator("button").filter({ hasText: "VIDEO" }).first();
  await expect(videoTile).toBeVisible();
  await expect(videoTile.locator("video")).toBeVisible();

  assertNoBrowserIssues();
});

test("mobile navigation renders and updates the URL hash", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const assertNoBrowserIssues = trackBrowserIssues(page);

  await page.goto("http://127.0.0.1:4173/");
  const mobileNav = page.locator("nav").filter({ has: page.getByRole("link", { name: "PROJECTS" }) }).last();
  await expect(mobileNav).toBeVisible();

  await mobileNav.getByRole("link", { name: "PROJECTS" }).click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.getByRole("heading", { name: /projects_db/i })).toBeVisible();

  assertNoBrowserIssues();
  await context.close();
});
