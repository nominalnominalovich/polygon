import {
  BASE_ACTIVE, BASE_AUTO, BASE_SIDE, CAPACITY, E1_INITIATIVES, E2_INITIATIVES, EFFECTS,
  MIX_OLD, MIX_PARTNER, OLD_N, PARTNER_N, SEGMENTS,
  type Delta, type E1Id, type E2Id, type Seg,
} from './scenario';

export type Rates = { active: Record<Seg, number>; auto: Record<Seg, number> };
export type Side = { avgTopup: number; bonusCost: number; unsub: number; support: number };
export type Cut = { m1: number; m2: number };
export type Month = { old: Cut; partner: Cut | null; total: Cut; side: Side; rates: Rates };
export type Trace = { label: string; deltas: Delta[] };
export type PushChoice = 'keep' | 'cut';

const r1 = (x: number) => Math.round(x * 10) / 10;

function apply(rates: Rates, deltas: Delta[]): Rates {
  const active = { ...rates.active };
  const auto = { ...rates.auto };
  for (const [s, da, dp] of deltas) {
    active[s] = Math.min(95, active[s] + da);
    auto[s] = Math.min(100, auto[s] + dp);
  }
  return { active, auto };
}

function cut(rates: Rates, mix: Record<Seg, number>): Cut {
  let m1 = 0;
  let m2 = 0;
  for (const s of SEGMENTS) {
    m1 += (mix[s] * rates.active[s]) / 100;
    m2 += (mix[s] * rates.auto[s]) / 100;
  }
  return { m1: r1(m1), m2: r1(m2) };
}

function month(rates: Rates, side: Side, withPartner: boolean): Month {
  const old = cut(rates, MIX_OLD);
  if (!withPartner) return { old, partner: null, total: old, side, rates };
  const partner = cut(rates, MIX_PARTNER);
  const n = OLD_N + PARTNER_N;
  // общий показатель считаем по невырезанным долям, чтобы не копить ошибку округления
  const raw = (mix: Record<Seg, number>, k: 'active' | 'auto') =>
    SEGMENTS.reduce((acc, s) => acc + (mix[s] * rates[k][s]) / 100, 0);
  const total = {
    m1: r1((raw(MIX_OLD, 'active') * OLD_N + raw(MIX_PARTNER, 'active') * PARTNER_N) / n),
    m2: r1((raw(MIX_OLD, 'auto') * OLD_N + raw(MIX_PARTNER, 'auto') * PARTNER_N) / n),
  };
  return { old, partner, total, side, rates };
}

export const baseRates: Rates = { active: { ...BASE_ACTIVE }, auto: { ...BASE_AUTO } };
export const baseline: Month = month(baseRates, { ...BASE_SIDE }, false);

export function cost1(ids: E1Id[]) {
  return ids.reduce((acc, id) => acc + E1_INITIATIVES.find((i) => i.id === id)!.cost, 0);
}

export function capacity2(e1: E1Id[]) {
  return CAPACITY - (e1.includes('A') ? 3 : 0);
}

export function cost2(ids: E2Id[]) {
  return ids.reduce((acc, id) => acc + E2_INITIATIVES.find((i) => i.id === id)!.cost, 0);
}

export function available2(e1: E1Id[]) {
  return E2_INITIATIVES.filter((i) => (!i.requires || e1.includes(i.requires)) && (!i.excludes || !e1.includes(i.excludes)));
}

export function hasResearch(e1: E1Id[], e2: E2Id[] = []) {
  return e1.includes('G') || e2.includes('Z');
}

export function simulate1(e1: E1Id[]): { m: Month; trace: Trace[] } {
  const trace: Trace[] = [];
  let rates = baseRates;
  const side: Side = { avgTopup: BASE_SIDE.avgTopup, bonusCost: 0, unsub: BASE_SIDE.unsub, support: BASE_SIDE.support + 60 };
  if (e1.includes('A')) {
    rates = apply(rates, EFFECTS.A_half);
    trace.push({ label: 'А · баллы (половина месяца из-за комплаенса)', deltas: EFFECTS.A_half });
    side.avgTopup = 1900;
    side.bonusCost = 0.55;
  }
  if (e1.includes('B')) {
    rates = apply(rates, EFFECTS.B);
    trace.push({ label: 'Б · напоминания', deltas: EFFECTS.B });
    side.unsub = 2.0;
    side.support += 10;
  }
  if (e1.includes('V')) {
    rates = apply(rates, EFFECTS.V);
    trace.push({ label: 'В · понятный автоперевод', deltas: EFFECTS.V });
    side.support -= 70;
  }
  return { m: month(rates, side, true), trace };
}

export function simulate2(e1: E1Id[], e2: E2Id[], push: PushChoice | null): { m: Month; trace: Trace[] } {
  const first = simulate1(e1);
  const trace: Trace[] = [];
  let rates = first.m.rates;
  const side: Side = { ...first.m.side };

  if (e1.includes('A')) {
    rates = apply(rates, EFFECTS.A_rest);
    trace.push({ label: 'А · баллы добирают полный эффект', deltas: EFFECTS.A_rest });
    side.avgTopup = 1500;
    side.bonusCost = 1.1;
  }
  if (e1.includes('B')) {
    if (e2.includes('EB')) {
      rates = apply(rates, EFFECTS.EB);
      trace.push({ label: 'Е-Б · пуш в день поступления денег', deltas: EFFECTS.EB });
      side.unsub = 1.3;
    } else if (push === 'cut') {
      rates = apply(rates, EFFECTS.push_cut);
      trace.push({ label: 'Пуши реже: эффект напоминаний частично затухает', deltas: EFFECTS.push_cut });
      side.unsub = 1.5;
    } else {
      rates = apply(rates, EFFECTS.push_keep);
      trace.push({ label: 'Пуши по-прежнему: усталость, эффект затухает', deltas: EFFECTS.push_keep });
      side.unsub = 3.0;
    }
  }
  if (e2.includes('D')) {
    const strong = hasResearch(e1, e2);
    const d = strong ? EFFECTS.D_research : EFFECTS.D;
    rates = apply(rates, d);
    trace.push({ label: strong ? 'Д · гибкое пополнение, настроенное по интервью' : 'Д · гибкое пополнение', deltas: d });
    side.support -= 40;
  }
  if (e2.includes('EV')) {
    rates = apply(rates, EFFECTS.EV);
    trace.push({ label: 'Е-В · уведомление до списания и «пропустить»', deltas: EFFECTS.EV });
    side.support -= 15;
  }
  if (e2.includes('EA')) {
    rates = apply(rates, EFFECTS.EA);
    trace.push({ label: 'Е-А · баллы без накрутки', deltas: EFFECTS.EA });
    side.avgTopup = 2100;
    side.bonusCost = 0.45;
  }
  if (e2.includes('A')) {
    rates = apply(rates, EFFECTS.A_half);
    trace.push({ label: 'А · баллы (половина месяца из-за комплаенса)', deltas: EFFECTS.A_half });
    side.avgTopup = 1900;
    side.bonusCost = 0.55;
  }
  if (e2.includes('B')) {
    rates = apply(rates, EFFECTS.B);
    trace.push({ label: 'Б · напоминания', deltas: EFFECTS.B });
    side.unsub = 2.0;
    side.support += 10;
  }
  if (e2.includes('V')) {
    rates = apply(rates, EFFECTS.V);
    trace.push({ label: 'В · понятный автоперевод', deltas: EFFECTS.V });
    side.support -= 70;
  }
  return { m: month(rates, side, true), trace };
}
