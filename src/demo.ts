// Готовые прохождения для показа на защите: решения заполнены, участник сразу видит последствия.
import { initial, setState, type Decision1, type Decision2, type State } from './store';

type Preset = { id: string; title: string; text: string; d1: Partial<Decision1>; d2: Partial<Decision2> };

export const PRESETS: Preset[] = [
  {
    id: 'strong',
    title: 'Сильный путь',
    text: 'Б+В, затем умные пуши и гибкое пополнение. Лучшая активность среди веток.',
    d1: {
      problem: 'forget', segment: 'manual_dropped', initiatives: ['B', 'V'], metric: 'M1', dir: 'up', value: '+6 п.п.', term: '1 месяц',
      rationale: 'По воронке 56% открывших настройку уходят без сохранения, а у 70% бросивших ручные пополнения деньги на карте были: люди забывают и боятся списаний. Опрос с откликом 9% смещён к вовлечённым. Пуши держу в пределах лимита банка.',
    },
    d2: {
      explanation: 'audience', initiatives: ['EB', 'D'], metric: 'M2', dir: 'up', value: '+10 п.п.', term: '1 месяц',
      changeText: 'По срезу у прежней аудитории автопополнение выросло до 28,5%, а общий показатель просел из-за 4 000 новых клиентов с нерегулярным доходом. Добавляю гибкое пополнение и привязываю пуши к дню поступления денег.',
    },
  },
  {
    id: 'bonus',
    title: 'Ловушка баллов',
    text: 'Напоминания, потом паника из-за дашборда и баллы. Активность растёт, накопления — нет.',
    d1: {
      problem: 'forget', segment: 'all', initiatives: ['B'], metric: 'M1', dir: 'up', value: '', term: '',
      rationale: 'Ирина и отзывы говорят, что людям нужна мотивация. Напоминания дешёвые и быстрые.',
    },
    d2: {
      explanation: 'failed', initiatives: ['A'], push: 'cut', metric: 'M1', dir: 'up', value: 'больше', term: '',
      changeText: 'Автопополнение упало, напоминания не помогли — запускаем баллы, как просит руководитель.',
    },
  },
  {
    id: 'research',
    title: 'Сначала исследование',
    text: 'В+Г, затем гибкое пополнение по итогам интервью. Лучшее автопополнение.',
    d1: {
      problem: 'distrust', segment: 'setup_abandoned', initiatives: ['V', 'G'], metric: 'M2', dir: 'up', value: '+8 п.п.', term: '1 месяц',
      rationale: 'Воронка: 56% уходят с экрана настройки автоперевода, 140 из 340 обращений — про условия списания. Опрос с откликом 9% ненадёжен, поэтому параллельно проверяю причины интервью.',
    },
    d2: {
      explanation: 'insufficient', initiatives: ['D', 'EV'], metric: 'M2', dir: 'up', value: '+12 п.п.', term: '1 месяц',
      changeText: 'Интервью предсказали рост доли людей с нерегулярным доходом. У прежней аудитории автопополнение выросло до 27,6%; для новой делаю гибкое пополнение по процентам и уведомление до списания.',
    },
  },
];

export function loadPreset(id: string) {
  const p = PRESETS.find((x) => x.id === id)!;
  setState((s): Partial<State> => ({
    ...initial,
    role: 'candidate',
    trace: s.trace,
    reviews: s.reviews,
    d1: { ...initial.d1, ...p.d1 },
    d1Done: true,
    d2: { ...initial.d2, ...p.d2 },
    split: p.id !== 'bonus',
    step: 'outcome1',
    reached: 'decision2',
  }));
}
