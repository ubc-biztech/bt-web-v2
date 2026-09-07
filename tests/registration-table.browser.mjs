// Run with `node tests/registration-table.browser.mjs` after installing Playwright.
// PLAYWRIGHT_MODULE can point to an existing Playwright installation.
// Uses the real table, styles and dialogs with a stub backend and Next router.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const temp = await mkdtemp(path.join(tmpdir(), "registration-table-test-"));
let browser;
let server;

try {
  const fixture = `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { DataTable } from './src/components/RegistrationTable/data-table';
    const rows = [
      ['Ada', 'year1', 'Science', 'Computer Science', 'registered'],
      ['Bea', 'year2', 'Science', 'Physics', 'registered'],
      ['Cam', '2', 'Business', 'Commerce', 'registered'],
      ['Dee', 'Other', 'Engineering', 'Computer Engineering', 'checkedIn'],
      ['Eli', 'year1', 'Science', 'Computer Science', 'waitlist'],
    ].map(([fname, year, faculty, major, registrationStatus], i) => ({
      id: fname.toLowerCase() + '@example.test', fname, 'eventID;year': 'fixture;2026',
      basicInformation: {fname, lname: 'Example', year, faculty, major},
      registrationStatus, applicationStatus: i === 0 ? 'Accepted' : 'reviewing',
      points: 0, isPartner: false, dynamicResponses: {}, studentId: 'fixture-' + i,
      updatedAt: 1788800000000
    }));
    window.fixtureRows = rows;
    window.requests = [];
    createRoot(document.getElementById('root')).render(
      <DataTable initialData={rows} dynamicColumns={[]} eventId="fixture" year="2026"
        eventData={{id:'fixture', year:2026, isApplicationBased: location.search.includes('applications'), registrationQuestions: []}} />
    );
  `;
  await build({
    absWorkingDir: root,
    stdin: { contents: fixture, resolveDir: root, loader: "tsx" },
    outfile: path.join(temp, "bundle.js"),
    bundle: true,
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"', process: '{"env":{}}' },
    loader: { ".svg": "dataurl", ".png": "dataurl", ".jpg": "dataurl" },
    plugins: [
      {
        name: "fixture-backend",
        setup(build) {
          build.onResolve({ filter: /^next\/router$/ }, () => ({
            path: "router",
            namespace: "fixture-router",
          }));
          build.onLoad({ filter: /.*/, namespace: "fixture-router" }, () => ({
            contents:
              "export const useRouter = () => ({query: {eventId: 'fixture', year: '2026'}, push() {}}); export default useRouter();",
          }));
          build.onResolve({ filter: /^(@\/lib\/db|\.\/db)$/ }, () => ({
            path: "backend",
            namespace: "fixture",
          }));
          build.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
            contents: `export async function fetchBackend(request) {
            window.requests.push(request);
            if (request.method === 'GET') return {data: window.fixtureRows.map(row => ({...row}))};
            if (request.method === 'PUT' && request.data.updates) {
              for (const update of request.data.updates) {
                const row = window.fixtureRows.find(row => row.id === update.email);
                row.applicationStatus = update.applicationStatus;
              }
            }
            return {};
          }`,
          }));
        },
      },
    ],
  });
  execFileSync(
    process.execPath,
    [
      path.join(root, "node_modules/tailwindcss/lib/cli.js"),
      "-i",
      "src/styles/globals.css",
      "-o",
      path.join(temp, "style.css"),
      "--minify",
    ],
    { cwd: root, stdio: "pipe" },
  );
  server = createServer(async (req, res) => {
    if (req.url === "/bundle.js" || req.url === "/style.css") {
      res.setHeader(
        "Content-Type",
        req.url.endsWith(".js") ? "text/javascript" : "text/css",
      );
      res.end(await readFile(path.join(temp, req.url.slice(1))));
    } else {
      res.setHeader("Content-Type", "text/html");
      res.end(
        '<!doctype html><html><head><link rel="stylesheet" href="/style.css"></head><body class="bg-bt-blue-600 text-white"><main style="padding:24px"><div id="root"></div></main><script src="/bundle.js"></script></body></html>',
      );
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_EXECUTABLE,
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on("pageerror", (error) => {
    errors.push(error.message);
    console.error("Browser error:", error.message);
  });
  const url = `http://127.0.0.1:${server.address().port}`;
  await page.route("**/*", (route) =>
    route.request().url().startsWith(url) ? route.continue() : route.abort(),
  );
  const expectRows = async (names) => {
    await page
      .waitForFunction(
        (names) => {
          const rows = [...document.querySelectorAll("tbody tr")];
          return (
            rows.length === names.length &&
            names.every((name) =>
              rows.some((row) =>
                row.textContent.includes(name + "@example.test"),
              ),
            )
          );
        },
        names.map((name) => name.toLowerCase()),
      )
      .catch(async (error) => {
        console.error(await page.locator("body").innerText());
        throw error;
      });
  };
  const requests = () => page.evaluate(() => window.requests);

  await page.goto(url);
  await expectRows(["Ada", "Bea", "Cam", "Dee"]);
  const firstName = page.getByRole("button", {
    name: "Sort by First Name",
    exact: true,
  });
  const widths = () =>
    page
      .locator("thead th")
      .evaluateAll((cells) =>
        cells.map((cell) => cell.getBoundingClientRect().width),
      );
  const before = await widths();
  await firstName.hover();
  assert.deepEqual(await widths(), before, "Hover must not resize any column");
  await firstName.focus();
  await page.keyboard.press("Enter");
  assert.deepEqual(
    await widths(),
    before,
    "Sorting must not resize any column",
  );
  assert.equal(await page.locator('th[aria-sort="ascending"]').count(), 1);
  assert.equal(
    await page
      .getByRole("button", { name: "Sort by App. Status", exact: true })
      .count(),
    0,
  );

  await page
    .getByLabel("Year standing", { exact: true })
    .selectOption("Year 2");
  await expectRows(["Bea", "Cam"]);
  await page.getByLabel("Faculty", { exact: true }).selectOption("Science");
  await expectRows(["Bea"]);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV", exact: true }).click();
  const csv = await readFile(await (await downloadPromise).path(), "utf8");
  assert.ok(!csv.includes("Application Status"));
  assert.ok(
    csv.includes("bea@example.test") && !csv.includes("ada@example.test"),
  );
  await page
    .getByLabel("Major", { exact: true })
    .selectOption("Computer Science");
  await page.getByText("No results.", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expectRows(["Ada", "Bea", "Cam", "Dee"]);
  await page.getByPlaceholder("Search by keyword...").fill("Year 2");
  await expectRows(["Bea", "Cam"]);
  await page.getByPlaceholder("Search by keyword...").fill("");
  await expectRows(["Ada", "Bea", "Cam", "Dee"]);

  await page
    .getByRole("button", { name: "Show or hide columns", exact: true })
    .click();
  await page
    .getByRole("menuitemcheckbox", { name: "Year Standing", exact: true })
    .click();
  assert.equal(
    await page
      .getByRole("button", { name: "Sort by Year Standing", exact: true })
      .count(),
    0,
  );
  await page
    .getByLabel("Year standing", { exact: true })
    .selectOption("Year 1");
  await expectRows(["Ada"]);
  await page
    .getByRole("combobox", { name: "Registration view", exact: true })
    .click();
  await page.getByRole("option", { name: "All", exact: true }).click();
  await expectRows(["Ada", "Eli"]);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expectRows(["Ada", "Bea", "Cam", "Dee", "Eli"]);
  await page
    .getByRole("combobox", { name: "Registration view", exact: true })
    .click();
  await page.getByRole("option", { name: "Attendees", exact: true }).click();
  await expectRows(["Ada", "Bea", "Cam", "Dee"]);
  await page
    .getByRole("checkbox", { name: "Select row", exact: true })
    .first()
    .check();
  assert.equal(
    await page
      .getByRole("button", { name: "Update application status", exact: true })
      .count(),
    0,
  );
  await page
    .getByRole("checkbox", { name: "Select row", exact: true })
    .first()
    .uncheck();
  if (process.env.SCREENSHOT_PATH)
    await page.screenshot({
      path: process.env.SCREENSHOT_PATH,
      fullPage: true,
    });

  // The row dialog should not expose stale application data on ordinary events.
  await page
    .locator("tbody tr")
    .first()
    .locator("svg.lucide-square-arrow-out-up-right")
    .click();
  await page.getByRole("dialog").waitFor();
  assert.ok(
    !(await page.getByRole("dialog").textContent()).includes(
      "Application Status",
    ),
  );
  const registrationStatus = page.getByRole("dialog").getByRole("combobox");
  await registrationStatus.click();
  const colors = await page.getByRole("listbox").evaluate((el) => ({
    background: getComputedStyle(el).backgroundColor,
    text: getComputedStyle(el).color,
  }));
  assert.notEqual(
    colors.background,
    "rgb(255, 255, 255)",
    "Dropdown must have a dark background",
  );
  assert.equal(colors.text, "rgb(255, 255, 255)");
  await page.getByRole("option", { name: "Registered", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .first()
    .click();

  async function addAttendee(expectedApplicationStatus) {
    await page
      .getByRole("button", { name: "+ Add Attendee", exact: true })
      .click();
    await page.getByLabel("Email *", { exact: true }).fill("new@example.test");
    await page.getByLabel("First Name *", { exact: true }).fill("New");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Add Attendee", exact: true })
      .click();
    await page.waitForFunction(() =>
      window.requests.some((r) => r.method === "POST"),
    );
    assert.equal(
      (await requests()).find((r) => r.method === "POST").data
        .applicationStatus,
      expectedApplicationStatus,
    );
  }
  await addAttendee("");

  await page.goto(url + "/?applications");
  await expectRows(["Ada", "Bea", "Cam", "Dee"]);
  await page
    .getByRole("button", { name: "Sort by App. Status", exact: true })
    .waitFor();
  await page
    .locator("tbody tr")
    .first()
    .locator("svg.lucide-square-arrow-out-up-right")
    .click();
  const appSelect = page.getByRole("combobox", {
    name: "Application status",
    exact: true,
  });
  await appSelect.click();
  assert.equal(
    await page
      .getByRole("option", { name: "Accepted", exact: true })
      .getAttribute("aria-selected"),
    "true",
  );
  await page.getByRole("option", { name: "Rejected", exact: true }).click();
  await page.waitForFunction(() =>
    window.requests.some((r) => r.method === "PUT"),
  );
  assert.equal(
    (await requests()).find((r) => r.method === "PUT").data.applicationStatus,
    "rejected",
  );
  await page
    .getByRole("button", { name: "Close", exact: true })
    .first()
    .click();
  await addAttendee("reviewing");
  await page
    .getByRole("checkbox", { name: "Select row", exact: true })
    .first()
    .check();
  await page
    .getByRole("button", { name: "Update application status", exact: true })
    .click();
  await page.getByRole("dialog").getByRole("combobox").click();
  assert.deepEqual(await page.getByRole("option").allTextContents(), [
    "Accepted",
    "Reviewing",
    "Waitlist",
    "Rejected",
  ]);
  await page.getByRole("option", { name: "Waitlist", exact: true }).click();
  await page
    .getByRole("button", { name: "Update 1 Registration", exact: true })
    .click();
  await page.waitForFunction(() =>
    window.requests.some((r) => r.data?.updates),
  );
  assert.deepEqual(
    (await requests())
      .find((r) => r.data?.updates)
      .data.updates.map((r) => r.applicationStatus),
    ["waitlist"],
  );
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await page.getByLabel("Year standing", { exact: true }).isVisible(),
  );
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(
    "PASS: stable hover/sort widths; demographic filtering/search; conditional application status; readable dropdowns; correct status and attendee payloads.",
  );
} finally {
  await browser?.close();
  if (server) await new Promise((resolve) => server.close(resolve));
  await rm(temp, { recursive: true, force: true });
}
