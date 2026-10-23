// Снимает экраны MVP для отчёта и презентации.
// node tools/shoot.mjs [baseUrl] [outDir]
import { chromium } from '/Users/roman/Projects/исток-инструкция/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:5190/polygon/';
const out = process.argv[3] ?? '/Users/roman/Public/hse-digital-products/скриншоты';
mkdirSync(out, { recursive: true });

const exp = { metric: 'M1', dir: 'up', value: '+6 п.п.', term: '1 месяц' };
const d1 = {
  ...exp, problem: 'forget', problemText: '', segment: 'manual_dropped', segmentText: '', initiatives: ['B', 'V'], alternative: '',
  rationale: 'По воронке 56% открывших настройку уходят без сохранения, а у 70% бросивших ручные пополнения деньги на карте были: люди забывают и боятся списаний. Опрос с откликом 9% смещён к вовлечённым, на него опираюсь меньше. Пуши держу в пределах лимита банка.',
};
const d2 = {
  metric: 'M2', dir: 'up', value: '+10 п.п.', term: '1 месяц', explanation: 'audience', explanationText: '', initiatives: ['EB', 'D'], push: null, rationale: '',
  changeText: 'По срезу у прежней аудитории автопополнение выросло до 28,5%, а общий показатель просел из-за 4 000 новых клиентов с нерегулярным доходом. Добавляю гибкое пополнение и привязываю пуши к дню поступления денег.',
};
const transfer = {
  problem: 'Отключают автоплатёж после неожиданного первого списания', segment: 'Отключившие в первые два дня после списания', initiatives: ['N', 'M'],
  expectation: 'Доля отключений в первый месяц: 38% → 25% за 2 месяца',
  rationale: '61% отключений — в два дня после списания, 61% ответов опроса — про сумму или момент списания. Опрос в моменте с откликом 55% надёжнее обычного. Кешбэк не решает проблему неожиданной суммы.',
  check: 'Доля отключений в первые два дня; обращения «почему списали столько»',
};
const bonus1 = { metric: 'M1', dir: 'up', value: '', term: '', problem: 'forget', problemText: '', segment: 'all', segmentText: '', initiatives: ['B'], alternative: '', rationale: 'Ирина и отзывы говорят, что людям нужна мотивация. Напоминания дешёвые и быстрые.' };
const bonus2 = { metric: 'M1', dir: 'up', value: 'больше', term: '', explanation: 'failed', explanationText: '', initiatives: ['A'], push: 'cut', rationale: '', changeText: 'Автопополнение упало, напоминания не помогли — запускаем баллы, как просит руководитель.' };
const full = { role: 'candidate', notes: ['Опрос смещён к вовлечённым?'], d1, d1Done: true, split: true, d2, d2Done: true, transfer, transferDone: true, shared: true, reviews: {}, trace: false };

const shots = [
  { name: '01-вход', hash: '/', state: { role: null } },
  { name: '02-программа', hash: '/program', state: { role: 'candidate', step: 'dossier', reached: 'dossier' } },
  { name: '03-досье', hash: '/play', state: { role: 'candidate', step: 'dossier', reached: 'dossier', notes: ['Опрос смещён к вовлечённым?'] } },
  { name: '04-досье-обоснование', hash: '/play', state: { role: 'candidate', step: 'dossier', reached: 'dossier', trace: true }, click: '.pg-trace__chip' },
  { name: '05-решение-1', hash: '/play', state: { ...full, d1Done: false, d2Done: false, step: 'decision1', reached: 'decision1' } },
  { name: '06-последствия', hash: '/play', state: { ...full, d2Done: false, step: 'outcome1', reached: 'outcome1' }, fullPage: true },
  { name: '07-пересмотр', hash: '/play', state: { ...full, d2Done: false, step: 'decision2', reached: 'decision2' } },
  { name: '08-разбор', hash: '/play', state: { ...full, step: 'debrief', reached: 'debrief' }, fullPage: true },
  { name: '09-разбор-обоснование', hash: '/play', state: { ...full, step: 'debrief', reached: 'debrief', trace: true } },
  { name: '10-самостоятельная', hash: '/play', state: { ...full, transferDone: false, shared: false, step: 'transfer', reached: 'transfer' } },
  { name: '11-карточка', hash: '/play', state: { ...full, step: 'card', reached: 'card' } },
  { name: '12-эксперт-список', hash: '/expert', state: { ...full, role: 'expert' } },
  { name: '13-эксперт-разбор', hash: '/expert/me', state: { ...full, role: 'expert' } },
  { name: '14-материалы-защиты', hash: '/defense', state: { role: 'candidate' } },
  { name: '15-ловушка-последствия', hash: '/play', state: { ...full, d1: bonus1, d2: bonus2, split: false, d2Done: false, step: 'outcome1', reached: 'decision2' } },
  { name: '16-ловушка-разбор', hash: '/play', state: { ...full, d1: bonus1, d2: bonus2, split: false, step: 'debrief', reached: 'debrief' }, fullPage: true },
];

const browser = await chromium.launch({ channel: 'chrome' });
for (const s of shots) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'ru-RU' });
  const page = await ctx.newPage();
  await page.goto(base);
  await page.evaluate((st) => localStorage.setItem('polygon:v1', JSON.stringify(st)), {
    role: null, step: 'dossier', reached: 'dossier', notes: [], d1: { ...d1, initiatives: [], rationale: '', problem: '', segment: '', metric: '', dir: '', value: '', term: '' },
    d1Done: false, split: false, d2: { ...d2, initiatives: [], explanation: '', changeText: '', metric: '', dir: '', value: '', term: '' }, d2Done: false,
    transfer: { problem: '', segment: '', initiatives: [], expectation: '', rationale: '', check: '' }, transferDone: false, shared: false, reviews: {}, trace: false,
    ...s.state,
  });
  await page.goto(`${base}#${s.hash}`);
  await page.reload();
  await page.waitForTimeout(500);
  if (s.click) { await page.click(s.click); await page.waitForTimeout(300); }
  await page.screenshot({ path: `${out}/${s.name}.png`, fullPage: !!s.fullPage });
  await ctx.close();
  console.log('✓', s.name);
}
await browser.close();
