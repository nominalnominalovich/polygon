import { useState } from 'react';
import { Accordion, Button, Caption, FormItem, NativeSelect, SimpleCell, Tabs, TabsItem, Text, Textarea, Title } from '@vkontakte/vkui';
import { Icon20ArrowLeftOutline, Icon20ChevronRight } from '@vkontakte/icons';
import { E4 } from '../sim/scenario';
import { STATUS_LABEL, type CriterionId, type Status } from '../sim/debrief';
import { setState, useStore, type Review, type Transfer } from '../store';
import { navigate } from '../router';
import { Trace } from '../components/Trace';
import { Panel, Pill } from '../components/ui';
import { E4_CRITERIA } from './steps/Transfer';
import { OWN_WORK_ID, WorkFields } from './steps/Card';
import { HINTS, code, critCode, useCodes } from '../labels';
import { Hint } from '../components/Hint';

type Work = { id: string; name: string; t: Transfer; review?: Review };

const DEMO: Work[] = [
  {
    id: 'anna',
    name: 'Анна С.',
    t: {
      problem: 'Клиенты отключают автоплатёж после первого неожиданного списания',
      segment: 'Отключившие в первые два дня после списания',
      initiatives: ['N', 'M'],
      expectation: 'Доля отключений в первый месяц: 38% → 25% за 2 месяца',
      rationale: '61% отключений — в два дня после списания; 61% ответов опроса — про сумму или момент списания. Опрос показывается в момент отключения, отклик 55% — ему можно доверять больше, чем обычному. Кешбэк не решает проблему неожиданной суммы.',
      check: 'Доля отключений в первые два дня; обращения «почему списали столько».',
      explanation: 'external',
      split: true,
      changeText: 'Разбивка показала: отключений из-за неожиданной суммы стало почти впятеро меньше (12,9 → 2,7 п.п.), а рост дала смена оператора (+9 п.п.). Решение оставляю и добавляю подсказку перенести автоплатёж при смене номера.',
    },
  },
  {
    id: 'boris',
    name: 'Борис Л.',
    t: {
      problem: 'Платить автоплатежом невыгодно',
      segment: 'Все клиенты',
      initiatives: ['K', 'L'],
      expectation: 'Больше подключений автоплатежа',
      rationale: 'Руководитель предлагает кешбэк, клиенты любят кешбэк. Напоминание увеличит подключения.',
      check: '',
      explanation: 'failed',
      split: false,
      changeText: 'Отключений стало больше, кешбэк не сработал — увеличим кешбэк до 5%.',
    },
  },
  {
    id: 'vera',
    name: 'Вера Н.',
    t: {
      problem: 'Люди не понимают, сколько и когда спишут',
      segment: 'Подключившие автоплатёж в этом месяце',
      initiatives: ['N', 'O'],
      expectation: 'Отключений станет меньше',
      rationale: 'Больше трети ответов — «списали больше, чем ожидал». Сначала поговорю с отключившими, чтобы понять, какой режим списания им нужен.',
      check: 'Отключения через месяц',
      explanation: 'insufficient',
      split: true,
      changeText: 'Общий показатель не изменился, но по причинам видно: неожиданных сумм стало меньше, а отключений из-за смены номера больше. Оставляю выбор режима и спрошу в интервью, как люди переносят номер.',
    },
  },
  {
    id: 'gleb',
    name: 'Глеб Т.',
    t: {
      problem: 'Списания приходятся на момент, когда денег мало',
      segment: 'Клиенты с низким остатком в день списания',
      initiatives: ['M', 'L'],
      expectation: 'Доля отключений −10 п.п. за месяц',
      rationale: '27% отключают, потому что денег на карте было мало. Пуш за день с кнопкой «пропустить» снимает страх, напоминание добавит подключений.',
      check: 'Отключения по причине «было мало денег»',
      explanation: 'external',
      split: false,
      changeText: 'Думаю, рост из-за тарифов оператора, поэтому решение оставляю как есть.',
    },
  },
  {
    id: 'daria',
    name: 'Дарья К.',
    t: {
      problem: 'Неожиданная сумма первого списания',
      segment: 'Новые подключения с режимом «до порога»',
      initiatives: ['N', 'M'],
      expectation: 'Отключения в первый месяц: 38% → 28% за месяц',
      rationale: 'По опросу в моменте две главные причины связаны с суммой и моментом списания. Режим «до порога» по умолчанию даёт сумму, которую человек не ждал.',
      check: 'Обращения «почему списали столько» и отключения в первые два дня',
      explanation: 'external',
      split: true,
      changeText: 'Своё решение сработало по двум причинам, рост дала смена оператора. Добавлю перенос автоплатежа при смене номера и уточню у поддержки, сколько таких обращений.',
    },
    review: {
      criteria: {
        K1: { status: 'seen', comment: '«Обоснование»: опирается на опрос в моменте и объясняет, почему ему можно верить.' },
        K2: { status: 'seen', comment: '«Сегмент»: сегмент привязан к режиму «до порога» — точно.' },
        K3: { status: 'partial', comment: '«Ожидание»: срок месяц, но не сказано, как отделить эффект от сезонности.' },
        K4: { status: 'seen', comment: '«Обоснование»: запросила разбивку и отделила смену оператора.' },
        K5: { status: 'seen', comment: '' },
        K6: { status: 'nodata', comment: 'Ограничений в задаче почти нет — по работе не видно.' },
      },
      question: 'Как вы поймёте через месяц, что снижение отключений — от режима списания, а не от того, что тарифы перестали расти?',
      savedAt: '2026-10-22T18:40:00.000Z',
      minutes: 9,
    },
  },
];

const FRAGMENTS = ['Проблема', 'Сегмент', 'Инициативы', 'Ожидание', 'Обоснование'];

export function Expert({ workId }: { workId?: string }) {
  const s = useStore();
  const [tab, setTab] = useState<'wait' | 'done' | 'all'>('wait');
  const works: Work[] = [...(s.shared && s.transfer2Done ? [{ id: OWN_WORK_ID, name: 'Ваша работа', t: s.transfer }] : []), ...DEMO];
  const reviewOf = (w: Work) => s.reviews[w.id] ?? w.review;
  const done = works.filter((w) => reviewOf(w)?.savedAt);
  const waiting = works.filter((w) => !reviewOf(w)?.savedAt);
  const shown = tab === 'wait' ? waiting : tab === 'done' ? done : works;
  const work = works.find((w) => w.id === workId);

  if (!work)
    return (
      <div className="pg-page">
        <Caption level="1" className="pg-muted">Продуктовый эксперт · банк «Кварц»</Caption>
        <Title level="1" className="pg-page__title">Работы кандидатов</Title>
        <Text className="pg-muted pg-page__lead">Только самостоятельные задачи, которые финалисты сами передали. Тренировочные попытки сюда не попадают.</Text>
        <Trace ids={['И6', 'Ф4']} status="mock" note="Сводка для руководителя школы: что показать после пилота. В MVP считается по разборам в этом браузере.">
          <Panel title="Сводка по потоку" tone="pale">
            {(() => {
              const mins = done.map((w) => reviewOf(w)!.minutes ?? 0).filter(Boolean).sort((a, b) => a - b);
              const med = mins.length ? mins[Math.floor((mins.length - 1) / 2)] : null;
              const q = done.filter((w) => reviewOf(w)!.question.trim()).length;
              return (
                <div className="pg-tiles">
                  <div className="pg-tile"><Caption level="1" className="pg-muted">Передано работ</Caption><div className="pg-tile__value">{works.length}</div></div>
                  <div className="pg-tile"><Caption level="1" className="pg-muted">Ожидают разбора</Caption><div className="pg-tile__value">{waiting.length}</div></div>
                  <div className="pg-tile"><Caption level="1" className="pg-muted">Минут на разбор, медиана</Caption><div className="pg-tile__value">{med ?? '—'}</div></div>
                  <div className="pg-tile"><Caption level="1" className="pg-muted">С вопросом для интервью</Caption><div className="pg-tile__value">{q}</div></div>
                </div>
              );
            })()}
          </Panel>
        </Trace>
        <Trace ids={['И6', 'Ф4', 'Э5']}>
          <Panel>
            <Tabs mode="secondary">
              <TabsItem selected={tab === 'wait'} onClick={() => setTab('wait')} status={waiting.length}>Ожидают разбора</TabsItem>
              <TabsItem selected={tab === 'done'} onClick={() => setTab('done')} status={done.length}>Разобраны</TabsItem>
              <TabsItem selected={tab === 'all'} onClick={() => setTab('all')} status={works.length}>Все</TabsItem>
            </Tabs>
            {shown.map((w) => (
              <SimpleCell key={w.id} onClick={() => navigate(`/expert/${w.id}`)} subtitle={w.t.problem} after={<Pill tone={reviewOf(w)?.savedAt ? 'green' : 'blue'}>{reviewOf(w)?.savedAt ? 'Разобрано' : 'Ожидает разбора'}</Pill>} chevron="always">
                {w.name}
              </SimpleCell>
            ))}
            {shown.length === 0 && <Text className="pg-muted pg-pad">{tab === 'done' ? 'Пока ничего не разобрано.' : 'Все работы разобраны.'}</Text>}
            {!(s.shared && s.transfer2Done) && s.jury && <Caption level="1" className="pg-muted pg-pad">Пройдите модуль за кандидата и передайте работу — она появится в этом списке.</Caption>}
          </Panel>
        </Trace>
      </div>
    );

  return <ReviewForm key={work.id} id={work.id} name={work.name} t={work.t} initial={reviewOf(work)} />;
}

function ReviewForm({ id, name, t, initial }: { id: string; name: string; t: Transfer; initial?: Review }) {
  const codes = useCodes();
  const [review, setReview] = useState<Review>(initial ?? { criteria: {}, question: '' });
  const [frag, setFrag] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [openedAt] = useState(() => Date.now());
  const setC = (c: CriterionId, p: Partial<{ status: Status; comment: string }>) =>
    setReview((r) => ({ ...r, criteria: { ...r.criteria, [c]: { status: 'nodata', comment: '', ...r.criteria[c], ...p } } }));

  return (
    <div className="pg-page pg-page--wide">
      <Button mode="tertiary" size="m" before={<Icon20ArrowLeftOutline />} onClick={() => navigate('/expert')}>Все работы</Button>
      <div className="pg-grid pg-grid--2">
        <Trace ids={['И6', 'Ф4', 'Э5']} note="Эксперт видит только переданную самостоятельную работу.">
          <Panel>
            <div className="pg-row"><Caption level="1" className="pg-muted">{E4.product}</Caption><Pill tone="blue">Самостоятельная работа</Pill></div>
            <Title level="2">{name}</Title>
            <WorkFields t={t} />
            <Accordion>
              <Accordion.Summary>Ориентиры автора кейса</Accordion.Summary>
              <Accordion.Content><ul className="pg-list pg-pad">{E4.strongSigns.map((x) => <li key={x}><Text>{x}</Text></li>)}</ul></Accordion.Content>
            </Accordion>
          </Panel>
        </Trace>
        <Trace ids={['И6']} note="Критерий 2: комментарий привязан к фрагменту; есть «недостаточно данных»; решения о найме нет.">
          <Panel title="Разбор по критериям">
            {E4_CRITERIA.map((c) => {
              const r = review.criteria[c.id];
              return (
                <div key={c.id} className="pg-review-row">
                  <Text weight="2">{code(critCode(c.id), c.title, codes)}</Text>
                  <Caption level="1" className="pg-muted">{c.what}</Caption>
                  <div className="pg-form2">
                    <FormItem top={<>Статус <Hint text={HINTS.nodata} /></>} noPadding>
                      <NativeSelect value={r?.status ?? ''} placeholder="Выберите" onChange={(e) => setC(c.id, { status: e.target.value as Status })}>
                        {(Object.keys(STATUS_LABEL) as Status[]).map((k) => <option key={k} value={k}>{STATUS_LABEL[k]}</option>)}
                      </NativeSelect>
                    </FormItem>
                    <FormItem top="Фрагмент работы" noPadding>
                      <NativeSelect value={frag[c.id] ?? ''} placeholder="К чему комментарий" onChange={(e) => setFrag((f) => ({ ...f, [c.id]: e.target.value }))}>
                        {FRAGMENTS.map((f) => <option key={f} value={f}>{f}</option>)}
                      </NativeSelect>
                    </FormItem>
                  </div>
                  <Textarea rows={2} value={r?.comment ?? ''} placeholder="Комментарий" onChange={(e) => setC(c.id, { comment: e.target.value })}
                    onBlur={() => { const f = frag[c.id]; if (f && r?.comment && !r.comment.startsWith('«')) setC(c.id, { comment: `«${f}»: ${r.comment}` }); }} />
                </div>
              );
            })}
            <FormItem top="Вопрос для интервью" noPadding>
              <Textarea rows={2} value={review.question} onChange={(e) => setReview((r) => ({ ...r, question: e.target.value }))} />
            </FormItem>
            <Text className="pg-muted">Итоговой оценки и решения о найме здесь нет: карточка — материал для разговора с кандидатом.</Text>
            <Button size="l" after={<Icon20ChevronRight />} onClick={() => { setState((st) => ({ reviews: { ...st.reviews, [id]: { ...review, savedAt: new Date().toISOString(), minutes: Math.max(1, Math.round((Date.now() - openedAt) / 60000)) } } })); setSaved(true); }}>Сохранить разбор</Button>
            {saved && <Text className="pg-positive">Сохранено. {id === OWN_WORK_ID ? 'Кандидат увидит комментарий в своей карточке.' : ''}</Text>}
          </Panel>
        </Trace>
      </div>
    </div>
  );
}
