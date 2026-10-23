import { useState } from 'react';
import { Accordion, Button, Caption, FormItem, NativeSelect, SimpleCell, Text, Textarea, Title } from '@vkontakte/vkui';
import { Icon20ArrowLeftOutline, Icon20ChevronRight } from '@vkontakte/icons';
import { E4 } from '../sim/scenario';
import { STATUS_LABEL, type CriterionId, type Status } from '../sim/debrief';
import { setState, useStore, type Review, type Transfer } from '../store';
import { navigate } from '../router';
import { Trace } from '../components/Trace';
import { Panel, Pill } from '../components/ui';
import { E4_CRITERIA } from './steps/Transfer';
import { OWN_WORK_ID, WorkFields } from './steps/Card';

const DEMO: { id: string; name: string; t: Transfer }[] = [
  {
    id: 'k17',
    name: 'Кандидат К-17',
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
    id: 'b04',
    name: 'Кандидат Б-04',
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
];

const FRAGMENTS = ['Проблема', 'Сегмент', 'Инициативы', 'Ожидание', 'Обоснование'];

export function Expert({ workId }: { workId?: string }) {
  const s = useStore();
  const works = [...(s.shared && s.transfer2Done ? [{ id: OWN_WORK_ID, name: 'Ваша работа (демо-прохождение)', t: s.transfer }] : []), ...DEMO];
  const work = works.find((w) => w.id === workId);

  if (!work)
    return (
      <div className="pg-page">
        <Caption level="1" className="pg-muted">Продуктовый эксперт · банк «Кварц»</Caption>
        <Title level="1" className="pg-page__title">Переданные работы</Title>
        <Text className="pg-muted pg-page__lead">Только самостоятельные работы, которые участники сами передали. Тренировочные попытки сюда не попадают.</Text>
        <Trace ids={['И6', 'Ф4']} status="mock" note="Сводка для руководителя школы: что показать после пилота. В MVP считается по разборам в этом браузере.">
          <Panel title="Сводка по потоку" tone="pale">
            {(() => {
              const done = works.filter((w) => s.reviews[w.id]?.savedAt);
              const mins = done.map((w) => s.reviews[w.id]!.minutes ?? 0).filter(Boolean).sort((a, b) => a - b);
              const med = mins.length ? mins[Math.floor((mins.length - 1) / 2)] : null;
              const q = done.filter((w) => s.reviews[w.id]!.question.trim()).length;
              return (
                <div className="pg-tiles">
                  <div className="pg-tile"><Caption level="1" className="pg-muted">Передано работ</Caption><div className="pg-tile__value">{works.length}</div></div>
                  <div className="pg-tile"><Caption level="1" className="pg-muted">Разобрано</Caption><div className="pg-tile__value">{done.length}</div></div>
                  <div className="pg-tile"><Caption level="1" className="pg-muted">Минут на разбор, медиана</Caption><div className="pg-tile__value">{med ?? '—'}</div></div>
                  <div className="pg-tile"><Caption level="1" className="pg-muted">С вопросом для интервью</Caption><div className="pg-tile__value">{q}</div></div>
                </div>
              );
            })()}
          </Panel>
        </Trace>
        <Trace ids={['И6', 'Ф4', 'Э5']}>
          <Panel>
            {works.map((w) => (
              <SimpleCell key={w.id} onClick={() => navigate(`/expert/${w.id}`)} subtitle={`${E4.product} · ${w.t.problem}`} after={<Pill tone={s.reviews[w.id]?.savedAt ? 'green' : 'blue'}>{s.reviews[w.id]?.savedAt ? 'Разобрано' : 'Ожидает разбора'}</Pill>} chevron="always">
                {w.name}
              </SimpleCell>
            ))}
            {!(s.shared && s.transfer2Done) && <Caption level="1" className="pg-muted pg-pad">Пройдите модуль за кандидата и передайте работу — она появится в этом списке.</Caption>}
          </Panel>
        </Trace>
      </div>
    );

  return <ReviewForm key={work.id} id={work.id} name={work.name} t={work.t} initial={s.reviews[work.id]} />;
}

function ReviewForm({ id, name, t, initial }: { id: string; name: string; t: Transfer; initial?: Review }) {
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
                  <Text weight="2">{c.id.replace('K', 'К')} · {c.title}</Text>
                  <Caption level="1" className="pg-muted">{c.what}</Caption>
                  <div className="pg-form2">
                    <FormItem top="Статус" noPadding>
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
