import type { E1Id, E2Id } from './scenario';
import type { Decision1, Decision2 } from '../store';
import { hasResearch } from './engine';

export type Status = 'seen' | 'partial' | 'unseen' | 'nodata';
export const STATUS_LABEL: Record<Status, string> = {
  seen: 'Видно в работе',
  partial: 'Частично',
  unseen: 'Не видно',
  nodata: 'Недостаточно данных',
};

export type CriterionId = 'K1' | 'K2' | 'K3' | 'K4' | 'K5' | 'K6';
export const CRITERIA: { id: CriterionId; title: string; what: string; by: 'rule' | 'ai' }[] = [
  { id: 'K1', title: 'Данные, а не мнения', what: 'Опора на поведение пользователей; надёжность каждого источника оценена', by: 'ai' },
  { id: 'K2', title: 'Действие ↔ сегмент', what: 'Действие адресовано причине конкретного сегмента', by: 'rule' },
  { id: 'K3', title: 'Проверяемое ожидание', what: 'Указаны метрика, направление, величина и срок', by: 'rule' },
  { id: 'K4', title: 'Разделение эффектов', what: 'Эффект релиза отделён от смены аудитории', by: 'rule' },
  { id: 'K5', title: 'Пересмотр по последствиям', what: 'Объяснено, что изменено и почему, со ссылкой на итог эпизода 1', by: 'ai' },
  { id: 'K6', title: 'Ограничения и побочные эффекты', what: 'Учтены ёмкость, комплаенс, лимит пушей, накрутка баллов', by: 'ai' },
];

export type Verdict = { id: CriterionId; status: Status; evidence: string; comment: string };

const has = (text: string, words: string[]) => {
  const t = text.toLowerCase();
  return words.find((w) => t.includes(w));
};

const quote = (text: string, word?: string) => {
  if (!text.trim()) return '—';
  if (!word) return `«${text.trim().slice(0, 140)}${text.trim().length > 140 ? '…' : ''}»`;
  const t = text.trim();
  const i = Math.max(0, t.toLowerCase().indexOf(word) - 50);
  const s = t.slice(i, i + 140);
  return `«${i > 0 ? '…' : ''}${s}${i + 140 < t.length ? '…' : ''}»`;
};

/** Текст без вставленных ссылок-чипов вида «[Источник: …]» — только свои слова участника. */
const own = (text: string) => text.replace(/\[[^\]]*\]/g, ' ').replace(/\s+/g, ' ').trim();
const words = (text: string) => own(text).split(' ').filter((w) => w.length > 2).length;
const NEGATION = ['не важн', 'неважн', 'не нужн', 'не имеет значения', 'не влияет'];

function expectation(d: { metric: string; dir: string; value: string; term: string }) {
  const full = d.metric && d.dir && d.value && d.term;
  return full ? 2 : d.metric ? 1 : 0;
}

const MATCH: Record<string, E1Id | 'D'> = { forget: 'B', distrust: 'V', motivation: 'A', irregular: 'D' };

export function judge(d1: Decision1, d2: Decision2, split: boolean): Verdict[] {
  const e1 = d1.initiatives as E1Id[];
  const e2 = d2.initiatives as E2Id[];
  const out: Verdict[] = [];

  // К1
  const r1 = own(d1.rationale);
  const chips = /\[[^\]]+\]/.test(d1.rationale);
  const dataWord = has(r1, ['воронк', '56', 'повтор', '42%', 'поведен', '70%', 'обращен', 'настройк']) ?? (chips ? has(d1.rationale, ['воронк', 'повтор', 'поддержк']) : undefined);
  const biasWord = has(r1, ['смещ', 'отклик', '9%', 'вовлеч', 'нерепрезент', 'не верю опрос', 'ненадёжн', 'ненадежн']);
  const opinionWord = has(r1, ['опрос', 'отзыв', 'ирина', 'конкурент']);
  const negated = has(r1, NEGATION);
  if (!d1.rationale.trim()) out.push({ id: 'K1', status: 'nodata', evidence: '—', comment: 'Обоснование не заполнено, оценить опору на данные нельзя.' });
  else if (words(d1.rationale) < 8) out.push({ id: 'K1', status: 'partial', evidence: quote(d1.rationale), comment: chips ? 'Ссылки на источники есть, но своего вывода из них нет: что они значат для решения?' : 'Обоснование слишком короткое, чтобы увидеть, как вы читаете данные.' });
  else if (negated) out.push({ id: 'K1', status: 'unseen', evidence: quote(r1, negated), comment: 'В обосновании данные отброшены как неважные. Воронка показывала, что 56% уходят с экрана настройки, а у 70% бросивших деньги были.' });
  else if (dataWord && (biasWord || e1.includes('G')) && words(d1.rationale) >= 20)
    out.push({ id: 'K1', status: 'seen', evidence: quote(r1, dataWord), comment: 'Решение опирается на поведенческие данные, а надёжность опроса проверена или поставлена под вопрос.' });
  else if (dataWord)
    out.push({ id: 'K1', status: 'partial', evidence: quote(r1 || d1.rationale, dataWord), comment: 'Поведенческие данные упомянуты, но не видно, как вы оценили надёжность опроса с откликом 9% и что из данных следует для решения.' });
  else
    out.push({ id: 'K1', status: 'unseen', evidence: quote(r1, opinionWord), comment: 'Аргументы держатся на мнениях (опрос, отзывы, стейкхолдеры). Воронка показывала, что 56% уходят с экрана настройки, а у 70% бросивших деньги были.' });

  // К2
  const need = MATCH[d1.problem];
  if (d1.problem === 'own' || !need) out.push({ id: 'K2', status: 'nodata', evidence: d1.problemText || '—', comment: 'Своя формулировка проблемы — соответствие оценит эксперт.' });
  else if (need === 'D') out.push({ id: 'K2', status: e2.includes('D') ? 'seen' : 'partial', evidence: 'Проблема: нерегулярный доход', comment: e2.includes('D') ? 'Проблема нерегулярного дохода закрыта гибким пополнением в эпизоде 2.' : 'В эпизоде 1 нет инициативы под нерегулярный доход; она появляется только в эпизоде 2 (Д).' });
  else if (e1.includes(need) && d1.problem !== 'motivation' && d1.segment === 'all') out.push({ id: 'K2', status: 'partial', evidence: 'Сегмент: все, у кого нет автопополнения', comment: 'Действие подходит к проблеме, но сегмент «все» слишком широк: у разных групп разные причины не копить.' });
  else if (e1.includes(need) && d1.problem !== 'motivation') out.push({ id: 'K2', status: 'seen', evidence: `Проблема и действие согласованы`, comment: d1.problem === 'forget' ? 'Забывающим нужны напоминания, и вы выбрали именно их.' : 'Тем, кто боится автоперевода, нужна прозрачность условий, и вы выбрали именно её.' });
  else if (d1.problem === 'motivation') out.push({ id: 'K2', status: 'partial', evidence: 'Проблема: нет мотивации копить', comment: 'Данные не подтверждают нехватку мотивации: у 70% бросивших деньги были, а 56% уходили с экрана настройки. Баллы поднимают активность тех, кто и не собирался копить.' });
  else if (e1.length === 1 && e1[0] === 'G') out.push({ id: 'K2', status: 'partial', evidence: 'Только исследование', comment: 'Разумно сначала проверить причины, но спринт прошёл без релиза.' });
  else out.push({ id: 'K2', status: 'unseen', evidence: 'Проблема и действие разошлись', comment: 'Выбранное действие не адресует ту причину, которую вы назвали проблемой.' });

  // К3
  const x1 = expectation(d1);
  const x2 = expectation(d2);
  const k3: Status = x1 === 2 && x2 === 2 ? 'seen' : x1 + x2 >= 2 ? 'partial' : 'unseen';
  out.push({ id: 'K3', status: k3, evidence: `Эпизод 1: ${d1.metric || '—'} ${d1.dir === 'up' ? '↑' : d1.dir === 'down' ? '↓' : ''} ${d1.value || ''} ${d1.term || ''}; эпизод 2: ${d2.metric || '—'} ${d2.dir === 'up' ? '↑' : d2.dir === 'down' ? '↓' : ''} ${d2.value || ''} ${d2.term || ''}`, comment: k3 === 'seen' ? 'Ожидания можно проверить: есть метрика, величина и срок.' : 'Ожидание без величины или срока нельзя проверить — непонятно, сработал ли релиз.' });

  // К4
  const research = hasResearch(e1);
  if (d2.explanation === 'failed') out.push({ id: 'K4', status: 'unseen', evidence: 'Объяснение: «релиз не сработал»', comment: 'Общий показатель смешал прежнюю аудиторию и 4 000 новых клиентов. У прежней аудитории эффект релиза был положительным.' });
  else if ((d2.explanation === 'audience' || d2.explanation === 'insufficient') && (split || research)) out.push({ id: 'K4', status: 'seen', evidence: split ? 'Запрошен срез по аудиториям' : 'Срез был доступен благодаря исследованию', comment: 'Вы отделили эффект своего релиза от изменения состава аудитории.' });
  else if (d2.explanation === 'audience') out.push({ id: 'K4', status: 'partial', evidence: 'Объяснение верное, но срез не запрошен', comment: 'Гипотеза о смене аудитории верна, но не проверена данными — срез был доступен одним действием.' });
  else if (d2.explanation === 'insufficient') out.push({ id: 'K4', status: 'partial', evidence: 'Отмечена нехватка данных, срез не посмотрен', comment: 'Вы честно отметили, что данных мало, но срез по аудиториям так и не открыли — вывод остался без проверки.' });
  else out.push({ id: 'K4', status: 'nodata', evidence: quote(d2.explanationText), comment: 'Своё объяснение — оценит эксперт.' });

  // К5
  const refWord = has(d2.changeText, ['месяц', 'срез', 'аудитор', 'результат', 'упал', 'вырос', 'эпизод', 'п.п', '%']);
  const changeWords = words(d2.changeText);
  if (changeWords >= 12 && refWord && d2.explanation === 'failed') out.push({ id: 'K5', status: 'partial', evidence: quote(d2.changeText, refWord), comment: 'Пересмотр ссылается на итоги месяца, но опирается на неверный вывод «релиз не сработал» — поэтому и новое решение бьёт мимо.' });
  else if (changeWords >= 12 && refWord) out.push({ id: 'K5', status: 'seen', evidence: quote(d2.changeText, refWord), comment: 'Пересмотр опирается на то, что произошло после первого релиза.' });
  else if (d2.changeText.trim()) out.push({ id: 'K5', status: 'partial', evidence: quote(d2.changeText), comment: 'Изменение названо, но не объяснено через результаты эпизода 1: какие метрики, у какой аудитории.' });
  else out.push({ id: 'K5', status: 'unseen', evidence: '—', comment: 'Не объяснено, что изменилось по сравнению с первым решением.' });

  // К6
  const misses: string[] = [];
  if (e1.includes('A') && !has(d1.rationale, ['комплаенс', 'согласован', 'бюджет'])) misses.push('комплаенс и бюджет баллов');
  if (e1.includes('B') && !has(d1.rationale, ['лимит', 'пуш', 'отпис'])) misses.push('общий лимит пушей');
  if (e2.includes('A') && !has(`${d2.changeText} ${d2.rationale}`, ['комплаенс', 'согласован', 'бюджет'])) misses.push('комплаенс и бюджет баллов');
  if ((e1.includes('A') && !e2.includes('EA')) || e2.includes('A')) misses.push('накрутка баллов: средняя сумма пополнения упала');
  if (e1.includes('B') && d2.push === 'keep' && !e2.includes('EB')) misses.push('рост отписок от пушей');
  const k6neg = has(own(`${d1.rationale} ${d2.changeText} ${d2.rationale}`), NEGATION);
  if (k6neg && misses.length === 0) out.push({ id: 'K6', status: 'partial', evidence: quote(own(`${d1.rationale} ${d2.changeText}`), k6neg), comment: 'Ограничения в решении соблюдены, но в обосновании они названы неважными — на реальном продукте это дорого.' });
  else if (misses.length === 0) out.push({ id: 'K6', status: 'seen', evidence: 'Ограничения учтены', comment: 'Решения укладываются в ёмкость и не создают неучтённых побочных эффектов.' });
  else out.push({ id: 'K6', status: misses.length > 1 ? 'unseen' : 'partial', evidence: `Не учтено: ${misses.join('; ')}`, comment: 'Побочные эффекты видны в метриках разбора — стоит учесть их до запуска.' });

  return out;
}

export function lessons(d1: Decision1, d2: Decision2, avgTopup = 2400): string[] {
  const e1 = d1.initiatives as E1Id[];
  const e2 = d2.initiatives as E2Id[];
  const out: string[] = [];
  if (e1.includes('A') || e2.includes('A'))
    out.push(e2.includes('EA')
      ? `Баллы подняли активность за счёт тех, кто раньше не копил, и средняя сумма пополнения падала. Ограничение «от 500 ₽ и серия 3 месяца» вернуло её к ${avgTopup.toLocaleString('ru-RU')} ₽: прокси-метрику удалось частично защитить от накрутки.`
      : `Баллы подняли активность за счёт тех, кто раньше не копил: средняя сумма пополнения упала с 2 400 до ${avgTopup.toLocaleString('ru-RU')} ₽. M1 вырос, а регулярные накопления почти нет. Это прокси-метрика, которую легко накрутить.`);
  if (e1.includes('B'))
    out.push(`Напоминания помогли тем, кто забывает (+20 п.п. у этого сегмента)${e1.includes('V') ? '' : ', но не тем, кто не доверяет автопереводу: 56% по-прежнему уходят с экрана настройки'}. ${e2.includes('EB') ? 'Привязка пуша к дню поступления денег не дала эффекту затухнуть.' : 'Если не привязать пуш к моменту, когда у человека есть деньги, через месяц эффект затухает.'}`);
  if (e1.includes('V'))
    out.push('Прозрачный автоперевод сработал на тех, кто боялся списаний: у сегмента «не доверяют» автопополнение выросло на 30 п.п., а обращений про автоперевод стало вдвое меньше.');
  if (d2.explanation === 'failed')
    out.push('Общее автопополнение упало, но у прежней аудитории оно выросло. Падение дали 4 000 новых клиентов: у них автопополнение около 5%. Перед выводом о провале проверьте состав аудитории.');
  if (e1.includes('G'))
    out.push('Исследование не дало релиза, зато показало, что опрос занижает долю забывающих больше чем вдвое и что почти пятая часть копит при нерегулярном доходе. Поэтому событие эпизода 2 не застало вас врасплох.');
  if (e2.includes('D'))
    out.push(hasResearch(e1, e2) ? 'Гибкое пополнение, настроенное по интервью, дало самый сильный эффект на сегменте с нерегулярным доходом.' : 'Гибкое пополнение сработало на нерегулярном доходе; с интервью эффект был бы выше — люди хотят минимальный порог и паузу в месяц без дохода.');
  if (e2.includes('I'))
    out.push('Наблюдать — тоже решение, если эффект ещё не измерен. Но цена — месяц без изменений для новой аудитории.');
  return out;
}
