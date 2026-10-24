// Учебная часть разбора: навыки модуля, понятия с источниками и рекомендации по итогам.
import { MIX_OLD, PARTNER_N, PROBLEMS, SEGMENT_CHOICES, SEGMENT_INFO, SURVEY, type E1Id, type E2Id, type Seg } from './scenario';
import { simulate1, simulate2 } from './engine';
import { STATUS_LABEL, type CriterionId, type Status, type Verdict } from './debrief';
import type { Decision1, Decision2 } from '../store';

/** «Чему научит» модуль 1. Статус навыка — худший из его критериев. */
export const SKILLS: { name: string; learn: string; ids: CriterionId[] }[] = [
  { name: 'Опора на данные', learn: 'Опираться на поведение клиентов, а не на мнения, и оценивать надёжность источника', ids: ['K1'] },
  { name: 'Действие под причину', learn: 'Выбирать действие под причину конкретной группы клиентов с учётом ограничений команды', ids: ['K2', 'K6'] },
  { name: 'Проверяемое ожидание', learn: 'Записывать ожидание так, чтобы его можно было проверить: метрика, направление, величина, срок', ids: ['K3'] },
  { name: 'Разделение эффектов', learn: 'Отделять эффект своего решения от внешних изменений и пересматривать решение по последствиям', ids: ['K4', 'K5'] },
];

const TIPS: Record<CriterionId, { miss: string; next: string }> = {
  K1: { miss: 'В следующий раз начните с поведения клиентов: воронки, повторных пополнений, обращений. И скажите, насколько можно верить опросу.', next: 'Потренируйте то же там, где опросу можно доверять: навык в оценке источника, а не в недоверии к опросам.' },
  K2: { miss: 'В следующий раз сначала назовите группу клиентов и её причину, а потом выбирайте действие, которое бьёт именно в неё.', next: 'Дальше проверяйте, не задевает ли действие соседние группы с другой причиной.' },
  K3: { miss: 'В следующий раз назовите величину и срок до запуска.', next: 'Дальше заранее решайте, какой результат будет значить, что релиз не сработал.' },
  K4: { miss: 'Когда общий показатель меняется, сначала откройте срез по аудиториям, а потом делайте вывод о релизе.', next: 'Дальше ищите внешние события и там, где о них не предупреждают.' },
  K5: { miss: 'Объясняя новое решение, ссылайтесь на конкретные метрики месяца 1 и на аудиторию, у которой они изменились.', next: 'Дальше пробуйте пересматривать решение, не отказываясь от того, что уже работает.' },
  K6: { miss: 'Перед запуском пройдитесь по ограничениям: ёмкость, комплаенс, лимит пушей и метрики, которые нельзя ухудшать.', next: 'Дальше заранее называйте метрики, которые не должны ухудшиться.' },
};

const RANK: Record<Status, number> = { unseen: 0, partial: 1, nodata: 2, seen: 3 };

export function skillResults(verdicts: Verdict[]) {
  return SKILLS.map((k) => {
    const worst = k.ids.map((id) => verdicts.find((v) => v.id === id)!).sort((a, b) => RANK[a.status] - RANK[b.status])[0];
    const tip = worst.status === 'seen' ? TIPS[k.ids[0]].next : TIPS[worst.id].miss;
    return { ...k, status: worst.status, tip, line: `${k.name}: ${STATUS_LABEL[worst.status].toLowerCase()}. ${tip}` };
  });
}

/** Понятие к каждому критерию: название, суть и один источник, где почитать. */
export const CONCEPTS: { id: CriterionId; title: string; text: string; source: string }[] = [
  {
    id: 'K1',
    title: 'Смещение опроса при низком отклике',
    text: 'Когда на опрос отвечает малая доля людей, ответившие обычно отличаются от остальных: они вовлечённее и охотнее говорят о продукте. Тогда опрос показывает мнение этой группы, а не всех клиентов. Такие ответы сверяют с поведением: воронкой, повторными действиями, обращениями.',
    source: 'Groves R. M. «Nonresponse Rates and Nonresponse Bias in Household Surveys». Public Opinion Quarterly, 2006.',
  },
  {
    id: 'K2',
    title: 'Сегментация по причинам поведения',
    text: 'Клиентов делят не по возрасту или доходу, а по тому, почему они поступают так, а не иначе. Группам с разными причинами нужны разные решения: напоминание поможет тому, кто забывает, и не поможет тому, кто боится списаний. Широкий сегмент «все» смешивает причины, и эффект размывается.',
    source: 'Christensen C., Cook S., Hall T. «Marketing Malpractice: The Cause and the Cure». Harvard Business Review, 2005.',
  },
  {
    id: 'K3',
    title: 'Проверяемое ожидание',
    text: 'Ожидание от релиза записывают до запуска так, чтобы потом можно было сказать, сбылось оно или нет: метрика, направление, величина и срок. «Станет лучше» проверить нельзя, «автопополнение +5 п.п. за месяц» можно. Без этого любой итог легко объяснить задним числом.',
    source: 'Gothelf J., Seiden J. «Lean UX». O’Reilly, 2013: шаблон гипотезы «мы поймём, что правы, когда увидим…».',
  },
  {
    id: 'K4',
    title: 'Смена состава аудитории (mix shift)',
    text: 'Общий показатель складывается из разных групп клиентов. Если приходит много новых людей с другим поведением, общее число может упасть, даже когда у прежних клиентов оно выросло. Это частный случай парадокса Симпсона, поэтому о релизе судят по срезу, а не по общему числу.',
    source: 'Pearl J., Mackenzie D. «The Book of Why». 2018, глава 6 о парадоксе Симпсона.',
  },
  {
    id: 'K5',
    title: 'Прокси-метрика и её накрутка, закон Гудхарта',
    text: 'Прокси-метрика заменяет цель, которую трудно измерить напрямую: активность вместо регулярных накоплений. Если награждать за саму прокси-метрику, люди растят её, а не цель. Закон Гудхарта: когда показатель становится целью, он перестаёт хорошо измерять. Пересматривая решение, легко погнаться именно за такой цифрой с дашборда.',
    source: 'Muller J. Z. «The Tyranny of Metrics». Princeton University Press, 2018.',
  },
  {
    id: 'K6',
    title: 'Сопутствующие метрики, которые нельзя ухудшать',
    text: 'Кроме главной метрики у релиза есть метрики-ограничители: растить их не цель, но и ухудшать нельзя. Обычно это отписки, обращения в поддержку, деньги на одного клиента. Их договариваются отслеживать до запуска, а не после жалоб.',
    source: 'Kohavi R., Tang D., Xu Y. «Trustworthy Online Controlled Experiments». Cambridge University Press, 2020, раздел о guardrail-метриках.',
  },
];

const n = (x: number) => x.toLocaleString('ru-RU');
const and = (list: string[]) => (list.length > 1 ? `${list.slice(0, -1).join(', ')} и ${list[list.length - 1]}` : list[0]);
const label = (list: readonly { id: string; label: string }[], id: string) => list.find((x) => x.id === id)?.label ?? '—';

/** Как понятие проявилось в этом прохождении: по выбору кандидата и числам модели. */
export function inRun(id: CriterionId, d1: Decision1, d2: Decision2, verdicts: Verdict[]): string {
  const e1 = d1.initiatives as E1Id[];
  const e2 = d2.initiatives as E2Id[];
  const r1 = simulate1(e1);
  const r2 = simulate2(e1, e2, d2.push);
  const status = verdicts.find((v) => v.id === id)?.status;

  if (id === 'K1') {
    const forgot = SURVEY.answers.find((a) => a.label.startsWith('Забыл'))!.value;
    const fact = `Опрос с откликом ${SURVEY.response}% показал «забыл, не успел» у ${forgot}% ответивших, а среди прежних клиентов забывающих ${MIX_OLD.S1}%.`;
    if (e1.includes('G')) return `${fact} Ваше исследование это и показало: в интервью «забываю» звучало чаще всего.`;
    if (status === 'seen') return `${fact} Вы поставили опрос под сомнение и опирались на поведение клиентов.`;
    return `${fact} Решение по опросу недооценило бы забывающих вдвое.`;
  }
  if (id === 'K2') {
    const problem = d1.problem === 'own' ? d1.problemText : label(PROBLEMS, d1.problem);
    const segment = d1.segment === 'own' ? d1.segmentText : label(SEGMENT_CHOICES, d1.segment);
    const touched = [...new Set([...r1.trace, ...r2.trace].flatMap((t) => t.deltas.filter(([, da, dp]) => da > 0 || dp > 0).map(([s]) => s as Seg)))];
    const groups = touched.length ? `Ваши релизы изменили поведение групп: ${and(touched.map((s) => `«${SEGMENT_INFO[s].name}»`))}.` : 'Ваши релизы не изменили поведение ни одной группы.';
    return `Вы выбрали проблему «${problem}» для сегмента «${segment}». ${groups}${d1.segment === 'all' ? ' Сегмент «все» смешивает эти причины.' : ''}`;
  }
  if (id === 'K3') {
    const parts = (d: Decision1 | Decision2) => ([['метрики', d.metric], ['направления', d.dir], ['величины', d.value.trim()], ['срока', d.term]] as const).filter(([, v]) => !v).map(([k]) => k);
    const line = (i: number, d: Decision1 | Decision2) => { const miss = parts(d); return miss.length ? `в решении ${i} не хватает ${and([...miss])}` : `решение ${i} можно проверить целиком`; };
    const text = `${line(1, d1)}; ${line(2, d2)}.`;
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  if (id === 'K4') {
    const { old, total, partner } = r1.m;
    const fact = `За месяц 1 автопополнение у прежней аудитории ${old.m2 > 18 ? `выросло с 18 до ${n(old.m2)}%` : 'осталось на 18%'}, а по всем целям ${total.m2 < 18 ? 'упало до' : 'вышло'} ${n(total.m2)}%: пришли ${n(PARTNER_N)} новых клиентов, у которых оно ${n(partner!.m2)}%.`;
    if (d2.explanation === 'failed') return `${fact} Вы прочитали это как провал релиза.`;
    if (status === 'seen') return `${fact} Вы посмотрели срез и отделили одно от другого.`;
    return fact;
  }
  if (id === 'K5') {
    if (e2.includes('EA')) return `Баллы подняли активность, а средняя сумма пополнения в месяце 1 упала с 2 400 до ${n(r1.m.side.avgTopup)} ₽. Ограничение «от 500 ₽ и серия из 3 месяцев» вернуло её к ${n(r2.m.side.avgTopup)} ₽.`;
    if (e1.includes('A') || e2.includes('A')) return `Баллы подняли активность до ${n(r2.m.total.m1)}%, а средняя сумма пополнения упала с 2 400 до ${n(r2.m.side.avgTopup)} ₽.`;
    const trap = simulate2(['B'], ['A'], 'cut').m;
    return `В вашем пути баллов не было. В ветке «Ловушка баллов» активность выросла до ${n(trap.total.m1)}%, а средняя сумма пополнения упала с 2 400 до ${n(trap.side.avgTopup)} ₽.`;
  }
  const { side } = r2.m;
  return `Отписки от пушей: было 1,2%, стало ${n(side.unsub)}%. Обращения в поддержку: было 340, стало ${n(side.support)}, при этом целей стало на 40% больше.${side.avgTopup !== 2400 ? ` Средняя сумма пополнения: было 2 400 ₽, стало ${n(side.avgTopup)} ₽.` : ''}`;
}
