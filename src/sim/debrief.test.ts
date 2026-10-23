import { describe, expect, it } from 'vitest';
import { judge } from './debrief';
import { simulate2 } from './engine';
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
    expect(simulate2(['B', 'V'], ['D', 'EV'], 'cut').m.total).toEqual({ m1: 56.6, m2: 34.5 });
  });
});
