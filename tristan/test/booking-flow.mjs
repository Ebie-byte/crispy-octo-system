import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";

const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1200, height: 900 } });
const errors = [];
page.on("pageerror", e => errors.push(String(e)));
page.on("console", m => { const t = m.text();
  if (m.type() === "error" && !t.includes("defaultProps")) errors.push(t); });

await page.goto("http://127.0.0.1:8899/build/index.html");
await page.waitForFunction(() => window.__ready === true, null, { timeout: 15000 });
await page.waitForTimeout(400);

let fail = 0;
const check = (n, c, extra="") => { console.log((c?"PASS  ":"FAIL  ")+n+(c?"":"  "+extra)); if(!c) fail++; };

check("no runtime errors on load", errors.length === 0, errors.join(" | "));

// 1. Standalone WhatsApp button is a real link to the right number
const waHref = await page.locator("#wa a").getAttribute("href");
check("WhatsApp button is an <a>", !!waHref);
check("WhatsApp button targets Tristan", (waHref||"").startsWith("https://wa.me/27721482950?"));
check("WhatsApp button prefills greeting",
      decodeURIComponent(new URL(waHref).searchParams.get("text")).includes("interested in joining Planet Fitness"));

// 2. Sheet starts hidden and does not block the page
const panel = page.locator('[role="dialog"]');
check("sheet hidden before click", !(await panel.isVisible()));

// 3. Book opens the sheet
await page.locator("#book button").click();
await page.waitForTimeout(500);
check("Book opens the sheet", await panel.isVisible());
{
  const m = await page.evaluate(() => {
    const el = document.querySelector('[role="dialog"]');
    const w = el.parentElement;
    return { h: el.clientHeight, scroll: el.scrollHeight, wrapH: w.clientHeight,
             wrapPos: getComputedStyle(w).position };
  });
  check("overlay is pinned to the viewport", m.wrapPos === "fixed", JSON.stringify(m));
  check("panel is not collapsed", m.h > 400, JSON.stringify(m));
  check("panel shows the form without scrolling", m.h >= m.scroll - 2, JSON.stringify(m));
}

// 4. Capture what submit hands to WhatsApp
await page.evaluate(() => { window.__opened = null;
  window.open = (u) => { window.__opened = u; return { closed:false }; }; });

await page.fill('input[type="text"]', "Sam Willemse");
await page.fill('input[type="tel"]', "083 555 0142");
await page.fill('input[type="email"]', "sam@example.com");
await page.selectOption("select", "De Waterkant");
await page.fill('input[type="date"]', "2026-09-15");
await page.fill('input[type="time"]', "07:30");
await page.fill("textarea", "Complete beginner, mornings work best.");
await page.locator('button[type="submit"]').click();
await page.waitForTimeout(500);

const opened = await page.evaluate(() => window.__opened);
check("submit opened a WhatsApp URL", !!opened, String(opened));
const text = opened ? decodeURIComponent(new URL(opened).searchParams.get("text")) : "";
check("goes to Tristan's number", (opened||"").startsWith("https://wa.me/27721482950?"));
for (const [label, v] of Object.entries({
  name:"Sam Willemse", phone:"083 555 0142", email:"sam@example.com",
  branch:"De Waterkant", date:"2026-09-15", time:"07:30",
  notes:"Complete beginner, mornings work best." })) {
  check("submit carries " + label, text.includes(v));
}

// 5. Honest handoff state, and Done closes
check("shows honest handoff wording",
      (await page.locator('[role="dialog"] h2').innerText()).includes("press send to finish"));
await page.locator('[role="dialog"] button:has-text("Done")').click();
await page.waitForTimeout(500);
check("Done closes the sheet", !(await panel.isVisible()));

// 6. Validation guards empty submits
await page.locator("#book button").click();
await page.waitForTimeout(400);
await page.evaluate(() => { window.__opened = null; });
check("form clears after a completed booking",
      (await page.inputValue('input[type="text"]')) === "",
      "still: " + (await page.inputValue('input[type="text"]')));
await page.locator('button[type="submit"]').click();
await page.waitForTimeout(300);
check("empty form does not open WhatsApp", (await page.evaluate(() => window.__opened)) === null);
check("empty form shows an error", await page.locator('[role="alert"]').isVisible());

// 7. Phone width still usable
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
const box = await panel.boundingBox();
check("sheet fits phone width", box && box.width <= 390, JSON.stringify(box));
const scrollX = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check("no horizontal overflow at 390px", scrollX <= 1, "overflow " + scrollX + "px");

console.log(fail ? `\n${fail} FAILED` : "\nAll checks passed");
await b.close();
process.exit(fail ? 1 : 0);
