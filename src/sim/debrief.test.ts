import { describe, expect, it } from 'vitest';
import { judge } from './debrief';
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
});
