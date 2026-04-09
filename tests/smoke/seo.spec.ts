import { expect, test } from "@playwright/test";
import { isTsilvaEuUrl } from "../../web/src/lib/url-utils";

test("tsilva.eu URL helper matches only same-domain HTTP(S) URLs", () => {
  expect(isTsilvaEuUrl("https://tsilva.eu")).toBe(true);
  expect(isTsilvaEuUrl("https://www.tsilva.eu")).toBe(true);
  expect(isTsilvaEuUrl("https://foo.tsilva.eu")).toBe(true);

  expect(isTsilvaEuUrl("https://example.com")).toBe(false);
  expect(isTsilvaEuUrl("mailto:tiago@tsilva.eu")).toBe(false);
  expect(isTsilvaEuUrl("ftp://foo.tsilva.eu")).toBe(false);
  expect(isTsilvaEuUrl("not a url")).toBe(false);
  expect(isTsilvaEuUrl(undefined)).toBe(false);
});

test("sitemap stays host-scoped to the canonical site origin", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBe(true);

  const xml = await response.text();

  expect(xml).toContain("<loc>https://www.tsilva.eu/</loc>");
  expect(xml).not.toContain("aipit.tsilva.eu");
  expect(xml).not.toContain("dedrive.tsilva.eu");
});

test("homepage HTML exposes related tsilva.eu sites in server-rendered output", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBe(true);

  const html = await response.text();

  expect(html).toContain("RELATED_SITES");
  expect(html).toContain('href="https://aipit.tsilva.eu"');
  expect(html).toContain('href="https://dedrive.tsilva.eu"');
});

test("robots.txt points to the same canonical sitemap origin", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.ok()).toBe(true);

  const robots = await response.text();

  expect(robots).toContain("Sitemap: https://www.tsilva.eu/sitemap.xml");
  expect(robots).not.toContain("curriculum-vitae-r2.tsilva.eu");
});
