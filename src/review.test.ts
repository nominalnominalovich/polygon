import { describe, expect, it } from 'vitest';
import { canSave, median, summaryText, tally } from './review';
import type { Review } from './store';

const all = (status: 'seen' | 'nodata' | 'partial') =>
  Object.fromEntries(['K1', 'K2', 'K3', 'K4', 'K5', 'K6'].map((id) => [id, { status, comment: '' }])) as Review['criteria'];

describe('разбор эксперта', () => {
  it('медиана: при чётном числе среднее двух средних значений', () => {
    expect(median([])).toBeNull();
    expect(median([9])).toBe(9);
    expect(median([12, 9])).toBe(10.5);
    expect(median([20, 9, 12])).toBe(12);
    expect(median([4, 20, 9, 12])).toBe(10.5);
  });

  it('итог по заданию считает «видно в работе» и «недостаточно данных» отдельно', () => {
    const r: Review = {
      criteria: { ...all('seen'), K3: { status: 'partial', comment: '' }, K6: { status: 'nodata', comment: '' } },
      question: 'Как отделите эффект?',
      summary: 'gaps',
    };
    expect(tally(r)).toEqual({ seen: 4, nodata: 1, total: 6 });
    expect(summaryText(r)).toBe('Есть пробелы. Видно в работе: 4 из 6, недостаточно данных: 1');
  });

  it('разбор не сохраняется без всех статусов, итога и вопроса', () => {
    expect(canSave({ criteria: {}, question: '' })).toBe(false);
    expect(canSave({ criteria: { K1: { status: 'seen', comment: '' } }, question: 'Вопрос', summary: 'strong' })).toBe(false);
    expect(canSave({ criteria: all('nodata'), question: 'Вопрос' })).toBe(false);
    expect(canSave({ criteria: all('nodata'), question: '   ', summary: 'weak' })).toBe(false);
    expect(canSave({ criteria: all('nodata'), question: 'Вопрос', summary: 'weak' })).toBe(true);
  });
});
