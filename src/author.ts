// Режим автора кейса (прототип): правки сценария хранятся в браузере и применяются до запуска приложения.
import { CAPACITY, E1_INITIATIVES, E2_INITIATIVES, EFFECTS, MIX_OLD, MIX_PARTNER, STAKEHOLDERS, type Delta, type E1Id, type E2Id, type Seg } from './sim/scenario';
import { available2, capacity2, cost1, cost2, simulate2 } from './sim/engine';

const KEY = 'polygon:author';

export type Override = {
  initiatives?: Record<string, { title?: string; text?: string; cost?: number }>;
  effects?: Partial<Record<keyof typeof EFFECTS, Delta[]>>;
  stakeholders?: Record<string, string>;
  mixOld?: Record<Seg, number>;
  mixPartner?: Record<Seg, number>;
};

const DEFAULTS = JSON.parse(JSON.stringify({
  e1: E1_INITIATIVES, e2: E2_INITIATIVES, effects: EFFECTS, stakeholders: STAKEHOLDERS, mixOld: MIX_OLD, mixPartner: MIX_PARTNER,
}));

export function loadOverride(): Override | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Override) : null;
  } catch {
    return null;
  }
}

/** Применяет правки к модулю сценария. Вызывается один раз до рендера. */
export function applyOverride(o: Override | null) {
  if (!o) return;
  for (const list of [E1_INITIATIVES, E2_INITIATIVES]) {
    for (const i of list) {
      const p = o.initiatives?.[i.code];
      if (!p) continue;
      if (p.title) i.title = p.title;
      if (p.text) i.text = p.text;
      if (typeof p.cost === 'number') i.cost = p.cost;
    }
  }
  for (const [k, v] of Object.entries(o.effects ?? {})) (EFFECTS as Record<string, Delta[]>)[k] = v as Delta[];
  for (const s of STAKEHOLDERS) if (o.stakeholders?.[s.name]) s.text = o.stakeholders[s.name];
  if (o.mixOld) Object.assign(MIX_OLD, o.mixOld);
  if (o.mixPartner) Object.assign(MIX_PARTNER, o.mixPartner);
}

export function currentOverride(): Override {
  return {
    initiatives: Object.fromEntries([...E1_INITIATIVES, ...E2_INITIATIVES].map((i) => [i.code, { title: i.title, text: i.text, cost: i.cost }])),
    effects: JSON.parse(JSON.stringify(EFFECTS)),
    stakeholders: Object.fromEntries(STAKEHOLDERS.map((s) => [s.name, s.text])),
    mixOld: { ...MIX_OLD },
    mixPartner: { ...MIX_PARTNER },
  };
}

const E1_SETS: E1Id[][] = [['A'], ['B'], ['V'], ['G'], ['A', 'G'], ['B', 'V'], ['B', 'G'], ['V', 'G']];
const subsets = <T,>(a: T[]): T[][] => a.reduce<T[][]>((acc, x) => acc.concat(acc.map((s) => [...s, x])), [[]]);

/** Те же проверки, что в тестах: доли сегментов, ёмкость, есть сильная и провальная ветка. */
export function validate(): string[] {
  const errors: string[] = [];
  const sum = (m: Record<string, number>) => Object.values(m).reduce((a, b) => a + b, 0);
  if (sum(MIX_OLD) !== 100) errors.push(`Доли сегментов прежней аудитории дают ${sum(MIX_OLD)}%, а должны 100%.`);
  if (sum(MIX_PARTNER) !== 100) errors.push(`Доли сегментов новой аудитории дают ${sum(MIX_PARTNER)}%, а должны 100%.`);
  if ([...E1_INITIATIVES, ...E2_INITIATIVES].some((i) => !Number.isInteger(i.cost) || i.cost < 0)) errors.push('Стоимость инициативы должна быть целым неотрицательным числом.');
  const fit = E1_SETS.filter((s) => cost1(s) <= CAPACITY);
  if (fit.length === 0) errors.push('Ни один набор инициатив эпизода 1 не помещается в ёмкость команды.');
  let strong = 0;
  let frozen = 0;
  for (const e1 of fit) {
    const opts = [...new Set(available2(e1).map((i) => i.id))] as E2Id[];
    for (const s of subsets(opts)) {
      if (!s.length || (s.includes('I') && s.length > 1) || cost2(s) > capacity2(e1)) continue;
      const m2 = simulate2(e1, s, e1.includes('B') && !s.includes('EB') ? 'cut' : null).m.total.m2;
      if (m2 >= 30) strong++;
      if (m2 < 18) frozen++;
    }
  }
  if (strong === 0) errors.push('Нет ни одной сильной ветки (автопополнение от 30%): кейс нельзя пройти хорошо.');
  if (frozen === 0) errors.push('Нет ни одной провальной ветки (автопополнение ниже 18%): в кейсе нельзя проиграть.');
  return errors;
}

export function save(o: Override) {
  localStorage.setItem(KEY, JSON.stringify(o));
}

export function reset() {
  localStorage.removeItem(KEY);
}

export { DEFAULTS };
