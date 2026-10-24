// Проверка горизонтального переполнения на телефоне: node tools/mobile-check.mjs [baseUrl]
import { chromium } from '/Users/roman/Projects/исток-инструкция/node_modules/playwright/index.mjs';
const base = process.argv[2] ?? 'http://localhost:5190/polygon/';
const steps = ['dossier', 'decision1', 'outcome1', 'decision2', 'debrief', 'transfer', 'card'];
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
await page.goto(base);
const check = async (label) => {
  await page.waitForTimeout(400);
  const r = await page.evaluate(() => {
    const W = document.documentElement.clientWidth;
    const wide = [...document.querySelectorAll('body *')].filter((e) => { const b = e.getBoundingClientRect(); return b.right > W + 1 && getComputedStyle(e).position !== 'fixed' && !e.closest('.pg-table, .pg-table-wrap, .pg-md table, .pg-trace__chips'); }).slice(0, 4).map((e) => `${e.tagName.toLowerCase()}.${[...e.classList].join('.')} → ${Math.round(e.getBoundingClientRect().right)}`);
    return { sw: document.documentElement.scrollWidth, W, wide };
  });
  console.log(`${r.sw > r.W ? '✗' : '✓'} ${label}: ${r.sw}/${r.W} ${r.wide.join(' | ')}`);
};
await page.goto(base + '#/'); await check('главная');
await page.evaluate(() => localStorage.setItem('polygon:v1', JSON.stringify({ role: 'candidate', jury: true })));
await page.goto(base + '#/program'); await page.reload(); await check('программа');
await page.click('.pg-tour >> text=Пропустить'); await page.click('text=Для защиты проекта'); await page.click('text=Сильный путь'); await check('последствия (пресет)');
for (const st of steps) {
  await page.evaluate((st) => { const s = JSON.parse(localStorage.getItem('polygon:v1')); s.step = st; s.reached = 'card'; s.d2Done = true; s.transferDone = st === 'card' || st === 'transfer'; s.transfer2Done = st === 'card'; localStorage.setItem('polygon:v1', JSON.stringify(s)); }, st);
  await page.reload(); await check(st);
}
await page.goto(base + '#/defense'); await check('материалы защиты');
await browser.close();
