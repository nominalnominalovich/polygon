// Экспорт презентации в PDF: node tools/deck-pdf.mjs <index.html> <out.pdf>
import { chromium } from '/Users/roman/Projects/исток-инструкция/node_modules/playwright/index.mjs';
import { pathToFileURL } from 'node:url';

const [src, out] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.goto(pathToFileURL(src).href, { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'print' });
await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
await browser.close();
console.log('✓', out);
