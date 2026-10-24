import { describe, expect, it } from 'vitest';
import { judge, lessons, outcome, reading } from './debrief';
import { available2, capacity2, cost1, cost2, simulate2 } from './engine';
import { CAPACITY, type E1Id, type E2Id } from './scenario';
import { PRESETS } from '../demo';
import { initial } from '../store';

const run = (id: string) => {
  const p = PRESETS.find((x) => x.id === id)!;
  const v = judge({ ...initial.d1, ...p.d1 }, { ...initial.d2, ...p.d2 }, p.id !== 'bonus');
  return Object.fromEntries(v.map((x) => [x.id, x.status]));
};

describe('разбор по критериям', () => {
  it('сильный путь: все критерии видны в работе', () => {
    expect(run('strong')).toEqual({ K1: 'seen', K2: 'seen', K3: 'seen', K4: 'seen', K5: 'seen', K6: 'seen' });
  });

  it('ловушка баллов: ошибка в разделении эффектов и побочные эффекты замечены', () => {
    const r = run('bonus');
    expect(r.K1).toBe('unseen');
    expect(r.K2).toBe('partial');
    expect(r.K4).toBe('unseen');
    expect(r.K5).toBe('partial');
    expect(r.K6).toBe('unseen');
  });

  it('без среза и исследования верная догадка засчитывается частично', () => {
    const p = PRESETS.find((x) => x.id === 'strong')!;
    const v = judge({ ...initial.d1, ...p.d1 }, { ...initial.d2, ...p.d2 }, false);
    expect(v.find((x) => x.id === 'K4')!.status).toBe('partial');
  });

  it('бессмыслица со словами из словаря не засчитывается', () => {
    const p = PRESETS.find((x) => x.id === 'strong')!;
    const d1 = { ...initial.d1, ...p.d1, rationale: 'воронка 9% пуш' };
    const d2 = { ...initial.d2, ...p.d2, changeText: 'в этом месяце всё поменяю, %' };
    const v = Object.fromEntries(judge(d1, d2, true).map((x) => [x.id, x.status]));
    expect(v.K1).not.toBe('seen');
    expect(v.K5).not.toBe('seen');
  });

  it('данные, названные неважными, не засчитываются', () => {
    const p = PRESETS.find((x) => x.id === 'strong')!;
    const d1 = { ...initial.d1, ...p.d1, rationale: 'Воронка не важна, опрос с откликом 9% доказывает: нужны баллы, лимит пушей не важен, всё остальное мелочи и шум.' };
    const v = Object.fromEntries(judge(d1, { ...initial.d2, ...p.d2 }, true).map((x) => [x.id, x.status]));
    expect(v.K1).toBe('unseen');
    expect(v.K6).not.toBe('seen');
  });

  it('обоснование из одних ссылок на источники — «частично»', () => {
    const p = PRESETS.find((x) => x.id === 'strong')!;
    const d1 = { ...initial.d1, ...p.d1, rationale: '[Воронка: 56% открывших настройку автоперевода уходят без сохранения] [Опрос: n = 420, отклик 9%] ' };
    const v = judge(d1, { ...initial.d2, ...p.d2 }, true);
    expect(v.find((x) => x.id === 'K1')!.status).toBe('partial');
  });

  it('пресет «Сильный путь» — лучшая ветка по активности', () => {
    expect(simulate2(['B', 'V'], ['D', 'EV'], 'cut').m.total).toEqual({ m1: 55, m2: 30.8 });
  });

  it('ловушка баллов заканчивается заморозкой проекта, сильный путь — нет', () => {
    const run2 = (id: string) => {
      const p = PRESETS.find((x) => x.id === id)!;
      const d1 = { ...initial.d1, ...p.d1 };
      const d2 = { ...initial.d2, ...p.d2 };
      return outcome(simulate2(d1.initiatives, d2.initiatives, d2.push).m, d1, d2);
    };
    expect(run2('bonus').level).toBe('frozen');
    expect(run2('bonus').reasons.length).toBeGreaterThan(1);
    expect(run2('strong').level).toBe('strong');
  });

  it('текст без словарных слов — «недостаточно данных», а не «держится на мнениях»', () => {
    const p = PRESETS.find((x) => x.id === 'strong')!;
    const d1 = { ...initial.d1, ...p.d1, rationale: 'Мне кажется, так будет лучше всего для нашего продукта и команды в целом.' };
    const k1 = judge(d1, { ...initial.d2, ...p.d2 }, true).find((x) => x.id === 'K1')!;
    expect(k1.status).toBe('nodata');
    expect(k1.comment).toMatch(/^Эвристика не нашла ссылок на данные/);
  });

  it('у каждого замороженного пути из 121 есть причина', () => {
    const sets: E1Id[][] = [['A'], ['B'], ['V'], ['G'], ['A', 'G'], ['B', 'V'], ['B', 'G'], ['V', 'G']];
    const subsets = <T,>(a: T[]): T[][] => a.reduce<T[][]>((acc, x) => acc.concat(acc.map((s) => [...s, x])), [[]]);
    let paths = 0;
    const frozen: string[] = [];
    const empty: string[] = [];
    for (const e1 of sets.filter((s) => cost1(s) <= CAPACITY)) {
      const opts = [...new Set(available2(e1).map((i) => i.id))] as E2Id[];
      for (const e2 of subsets(opts)) {
        if (!e2.length || (e2.includes('I') && e2.length > 1) || cost2(e2) > capacity2(e1)) continue;
        for (const push of e1.includes('B') && !e2.includes('EB') ? (['keep', 'cut'] as const) : [null]) {
          paths++;
          const res = outcome(simulate2(e1, e2, push).m, { ...initial.d1, initiatives: e1 }, { ...initial.d2, initiatives: e2, push });
          const name = `${e1.join('+')} → ${e2.join('+')} ${push ?? ''}`;
          if (res.level === 'frozen') frozen.push(name);
          if (res.level === 'frozen' && res.reasons.length === 0) empty.push(name);
        }
      }
    }
    expect(paths).toBe(121);
    expect(frozen.length).toBe(52);
    expect(empty).toEqual([]);
  });

  it('итог для продукта и прочтение дашборда разведены', () => {
    const p = PRESETS.find((x) => x.id === 'strong')!;
    const d1 = { ...initial.d1, ...p.d1 };
    const d2 = { ...initial.d2, ...p.d2, explanation: 'failed' };
    const res = outcome(simulate2(d1.initiatives, d2.initiatives, d2.push).m, d1, d2);
    const k4 = judge(d1, d2, true).find((x) => x.id === 'K4')!;
    expect(res.title).toBe('Итог для продукта: сильный рост');
    expect(res.text).toContain('+12,8 п.п.');
    expect(reading(k4.status, d2.initiatives, res.level)).toContain('Рост дало гибкое пополнение, а не верное прочтение дашборда');
  });

  it('«не застало врасплох» — только если знание из исследования стало решением', () => {
    const d1 = { ...initial.d1, initiatives: ['V', 'G'] as E1Id[] };
    const ready = lessons(d1, { ...initial.d2, initiatives: ['D', 'EV'], explanation: 'insufficient' }).join(' ');
    const caught = lessons(d1, { ...initial.d2, initiatives: ['Z'], explanation: 'insufficient' }).join(' ');
    expect(ready).toContain('не застало вас врасплох');
    expect(caught).not.toContain('не застало вас врасплох');
  });
});
