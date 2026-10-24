// Итог по заданию в разборе эксперта: счёт по статусам критериев и вывод эксперта.
import { CRITERIA } from './sim/debrief';
import type { Review } from './store';

export const SUMMARY_LABEL: Record<NonNullable<Review['summary']>, string> = {
  strong: 'Сильная работа',
  gaps: 'Есть пробелы',
  weak: 'Слабая работа',
};

export function tally(r: Review) {
  const st = CRITERIA.map((c) => r.criteria[c.id]?.status);
  return { seen: st.filter((x) => x === 'seen').length, nodata: st.filter((x) => x === 'nodata').length, total: CRITERIA.length };
}

/** «Есть пробелы. Видно в работе: 4 из 6, недостаточно данных: 1» */
export function summaryText(r: Review) {
  const t = tally(r);
  return `${r.summary ? `${SUMMARY_LABEL[r.summary]}. ` : ''}Видно в работе: ${t.seen} из ${t.total}, недостаточно данных: ${t.nodata}`;
}

/** Сохранить можно, когда стоят все статусы, итог и есть вопрос для интервью. Комментарии необязательны. */
export const canSave = (r: Review) => CRITERIA.every((c) => r.criteria[c.id]) && !!r.summary && r.question.trim().length > 0;

export function median(xs: number[]) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
