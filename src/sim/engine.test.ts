import { describe, expect, it } from 'vitest';
import { baseline, simulate1, simulate2 } from './engine';

// Контрольные прохождения из сценария (раздел 8): одинаковые выборы дают одинаковый результат.
describe('контрольные прохождения', () => {
  it('исходная точка', () => {
    expect(baseline.old).toEqual({ m1: 37.2, m2: 18 });
  });

  it('1. В+Г → Д (с исследованием) + Е-В', () => {
    const m1 = simulate1(['V', 'G']).m;
    expect(m1.old).toEqual({ m1: 44.2, m2: 27.6 });
    expect(m1.total).toEqual({ m1: 40.1, m2: 21.6 });
    const m2 = simulate2(['V', 'G'], ['D', 'EV'], null).m;
    expect(m2.old).toEqual({ m1: 52.8, m2: 36.6 });
    expect(m2.total).toEqual({ m1: 52.7, m2: 35 });
    expect(m1.side.support).toBe(330);
    expect(m2.side.support).toBe(275);
  });

  it('2. Б → сократить пуши + Ж(А)', () => {
    const m1 = simulate1(['B']).m;
    expect(m1.old).toEqual({ m1: 44.1, m2: 18.9 });
    expect(m1.total).toEqual({ m1: 41.3, m2: 15.1 });
    const m2 = simulate2(['B'], ['A'], 'cut').m;
    expect(m2.old).toEqual({ m1: 46.5, m2: 18.9 });
    expect(m2.total).toEqual({ m1: 44, m2: 15.1 });
    expect(m2.side).toMatchObject({ avgTopup: 1900, bonusCost: 0.55, unsub: 1.5 });
  });

  it('3. Б+В → Е-Б + Д', () => {
    const m1 = simulate1(['B', 'V']).m;
    expect(m1.old).toEqual({ m1: 51.1, m2: 28.5 });
    expect(m1.total).toEqual({ m1: 46.5, m2: 22.3 });
    const m2 = simulate2(['B', 'V'], ['EB', 'D'], null).m;
    expect(m2.old).toEqual({ m1: 57.9, m2: 34.5 });
    expect(m2.total).toEqual({ m1: 55.7, m2: 32.9 });
    expect(m2.side.unsub).toBe(1.3);
  });

  it('4. А+Г → Е-А + наблюдать', () => {
    const m1 = simulate1(['A', 'G']).m;
    expect(m1.old).toEqual({ m1: 41.1, m2: 18 });
    expect(m1.total).toEqual({ m1: 38.8, m2: 14.3 });
    const m2 = simulate2(['A', 'G'], ['EA', 'I'], null).m;
    expect(m2.old).toEqual({ m1: 42.8, m2: 18 });
    expect(m2.total).toEqual({ m1: 40, m2: 14.3 });
    expect(m2.side).toMatchObject({ avgTopup: 2100, bonusCost: 0.45 });
  });

  it('5. Б → оставить пуши + Д', () => {
    const m2 = simulate2(['B'], ['D'], 'keep').m;
    expect(m2.old).toEqual({ m1: 46.4, m2: 24.9 });
    expect(m2.total).toEqual({ m1: 46.7, m2: 25.6 });
    expect(m2.side.unsub).toBe(3);
  });

  it('повторное прохождение даёт тот же результат', () => {
    expect(simulate2(['B', 'V'], ['EB', 'D'], null)).toEqual(simulate2(['B', 'V'], ['EB', 'D'], null));
  });
});
