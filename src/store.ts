import { useSyncExternalStore } from 'react';
import type { E1Id, E2Id, E4Id } from './sim/scenario';
import type { CriterionId, Status } from './sim/debrief';
import type { PushChoice } from './sim/engine';

export type Expectation = { metric: string; dir: '' | 'up' | 'down'; value: string; term: string };

export type Decision1 = Expectation & {
  problem: string;
  problemText: string;
  segment: string;
  segmentText: string;
  initiatives: E1Id[];
  rationale: string;
  alternative: string;
  assumptions?: string;
};

export type Decision2 = Expectation & {
  explanation: string;
  explanationText: string;
  initiatives: E2Id[];
  push: PushChoice | null;
  changeText: string;
  rationale: string;
};

export type Transfer = {
  problem: string;
  segment: string;
  initiatives: E4Id[];
  expectation: string;
  rationale: string;
  check: string;
  explanation?: string;
  explanationText?: string;
  split?: boolean;
  changeText?: string;
  assumptions?: string;
};

export type Review = { criteria: Partial<Record<CriterionId, { status: Status; comment: string }>>; question: string; savedAt?: string; minutes?: number; summary?: 'strong' | 'gaps' | 'weak' };

export type Step = 'dossier' | 'decision1' | 'outcome1' | 'decision2' | 'debrief' | 'transfer' | 'card';
export const STEPS: { id: Step; label: string; screen: string }[] = [
  { id: 'dossier', label: 'Досье', screen: 'Э1' },
  { id: 'decision1', label: 'Решение', screen: 'Э2' },
  { id: 'outcome1', label: 'Последствия', screen: 'Э3' },
  { id: 'decision2', label: 'Пересмотр', screen: 'Э2' },
  { id: 'debrief', label: 'Разбор', screen: 'Э3' },
  { id: 'transfer', label: 'Самостоятельная', screen: 'Э4' },
  { id: 'card', label: 'Карточка', screen: 'Э5' },
];

export type State = {
  role: 'candidate' | 'expert' | null;
  step: Step;
  reached: Step;
  notes: string[];
  d1: Decision1;
  d1Done: boolean;
  split: boolean;
  d2: Decision2;
  d2Done: boolean;
  transfer: Transfer;
  transferDone: boolean;
  transfer2Done: boolean;
  shared: boolean;
  reviews: Record<string, Review>;
  trace: boolean;
  jury: boolean;
  tours: { candidate?: boolean; expert?: boolean };
  candidateId: number | null;
  /** Сколько подсказок-вопросов взято на решениях 1 и 2. Эксперт их не видит. */
  hints: { d1: number; d2: number };
  /** Самооценка кандидата по критериям после самостоятельной задачи. Эксперт её не видит. */
  selfReview: { criteria: Partial<Record<CriterionId, Status>>; done: boolean };
  /** Прежние попытки решения 2: «Переиграть месяц 2» сохраняет первую, чтобы показать обе в разборе. */
  attempts: Decision2[];
};

const emptyExp: Expectation = { metric: '', dir: '', value: '', term: '' };

export const initial: State = {
  role: null,
  step: 'dossier',
  reached: 'dossier',
  notes: [],
  d1: { ...emptyExp, problem: '', problemText: '', segment: '', segmentText: '', initiatives: [], rationale: '', alternative: '' },
  d1Done: false,
  split: false,
  d2: { ...emptyExp, explanation: '', explanationText: '', initiatives: [], push: null, changeText: '', rationale: '' },
  d2Done: false,
  transfer: { problem: '', segment: '', initiatives: [], expectation: '', rationale: '', check: '' },
  transferDone: false,
  transfer2Done: false,
  shared: false,
  reviews: {},
  trace: false,
  jury: false,
  tours: {},
  candidateId: null,
  hints: { d1: 0, d2: 0 },
  selfReview: { criteria: {}, done: false },
  attempts: [],
};

const KEY = 'polygon:v1';

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...initial, ...JSON.parse(raw) };
  } catch {
    /* хранилище недоступно — работаем в памяти */
  }
  return initial;
}

let state: State = load();
const listeners = new Set<() => void>();

export function setState(patch: Partial<State> | ((s: State) => Partial<State>)) {
  const next = typeof patch === 'function' ? patch(state) : patch;
  state = { ...state, ...next };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* см. load */
  }
  listeners.forEach((l) => l());
}

export function useStore(): State {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

const ORDER = STEPS.map((s) => s.id);
export function goStep(step: Step) {
  setState((s) => ({ step, reached: ORDER.indexOf(step) > ORDER.indexOf(s.reached) ? step : s.reached }));
  window.scrollTo({ top: 0 });
}

export function resetRun() {
  setState((s) => ({ ...initial, role: s.role, trace: s.trace, jury: s.jury, tours: s.tours, reviews: s.reviews, candidateId: s.candidateId }));
}

/** Номер кандидата присваивается при первом входе и потом не меняется. Демо-работы заняты номерами до 1100. */
export const newCandidateId = () => 1100 + Math.floor(Math.random() * 900);

export function setRole(role: State['role']) {
  setState((s) => ({ role, candidateId: role === 'candidate' ? s.candidateId ?? newCandidateId() : s.candidateId }));
}

export function exitJury() {
  setState({ jury: false, trace: false });
}
