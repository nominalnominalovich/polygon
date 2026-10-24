import { Button, Caption, Headline, Text, Title } from '@vkontakte/vkui';
import { Icon20ChevronRight, Icon20CommentOutline, Icon20SlidersOutline, Icon20StatisticsOutline } from '@vkontakte/icons';
import { MIX_OLD, MIX_PARTNER, SEGMENTS, SEGMENT_INFO, type E1Id, type E2Id } from '../../sim/scenario';
import { baseline, simulate1, simulate2, type PushChoice } from '../../sim/engine';
import { CRITERIA, STATUS_LABEL, judge, lessons, outcome, reading } from '../../sim/debrief';
import { inRun } from '../../sim/learning';
import { goStep, resetRun, useStore } from '../../store';
import { Trace } from '../../components/Trace';
import { Delta, Panel, Pill, Tile, fmt } from '../../components/ui';
import { SplitTable } from './Outcome1';
import { code, critCode, stripCode, useCodes } from '../../labels';
import { Concept } from '../../components/Concept';
import { navigate } from '../../router';

function Line({ title, series }: { title: string; series: { name: string; values: number[]; tone: string; dash?: boolean }[] }) {
  const W = 360, H = 170, P = 28;
  const all = series.flatMap((s) => s.values);
  const lo = Math.floor(Math.min(...all) / 5) * 5 - 5;
  const hi = Math.ceil(Math.max(...all) / 5) * 5 + 5;
  const x = (i: number) => P + (i * (W - 2 * P)) / 2;
  const y = (v: number) => H - P - ((v - lo) / (hi - lo)) * (H - 2 * P);
  return (
    <figure className="pg-line">
      <Text weight="2">{title}</Text>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <line x1={x(i)} x2={x(i)} y1={P - 8} y2={H - P} className="pg-line__grid" />
            <text x={x(i)} y={H - 8} textAnchor="middle" className="pg-line__axis">{['Старт', 'Месяц 1', 'Месяц 2'][i]}</text>
          </g>
        ))}
        {series.map((s, si) => (
          <g key={s.name}>
            <polyline points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke={s.tone} strokeWidth="2.5" strokeDasharray={s.dash ? '5 4' : undefined} />
            {s.values.map((v, i) => {
              const below = si > 0;
              const dup = si > 0 && series[0].values[i] === v;
              return (
                <g key={i}>
                  <circle cx={x(i)} cy={y(v)} r="4" fill={s.tone} />
                  {!dup && <text x={x(i)} y={below ? y(v) + 18 : y(v) - 9} textAnchor="middle" className="pg-line__val" fill={s.tone}>{fmt(v)}</text>}
                </g>
              );
            })}
          </g>
        ))}
      </svg>
      <figcaption className="pg-legend">
        {series.map((s) => <span key={s.name}><i style={{ background: s.tone }} className={s.dash ? 'is-dash' : ''} />{s.name}</span>)}
      </figcaption>
    </figure>
  );
}

const PATHS: { name: string; full: string; e1: E1Id[]; e2: E2Id[]; push: PushChoice | null }[] = [
  { name: 'Б+В → Д + Е-В, пуши реже', full: 'Напоминания и понятный автоперевод → гибкое пополнение и «пропустить платёж», пуши реже', e1: ['B', 'V'], e2: ['D', 'EV'], push: 'cut' },
  { name: 'В+Г → Д (по интервью) + Е-В', full: 'Понятный автоперевод и интервью → гибкое пополнение по итогам интервью и «пропустить платёж»', e1: ['V', 'G'], e2: ['D', 'EV'], push: null },
  { name: 'Б → пуши реже + баллы', full: 'Напоминания → баллы за пополнения, пуши реже', e1: ['B'], e2: ['A'], push: 'cut' },
  { name: 'Б+В → умные пуши + Д', full: 'Напоминания и понятный автоперевод → пуш в день поступления денег и гибкое пополнение', e1: ['B', 'V'], e2: ['EB', 'D'], push: null },
  { name: 'А+Г → баллы без накрутки', full: 'Баллы и интервью → баллы только от 500 ₽, наблюдать', e1: ['A', 'G'], e2: ['EA', 'I'], push: null },
  { name: 'Б → пуши как были + Д', full: 'Напоминания → гибкое пополнение, пуши как были', e1: ['B'], e2: ['D'], push: 'keep' },
];

export function Debrief() {
  const s = useStore();
  const codes = useCodes();
  const e1 = s.d1.initiatives;
  const e2 = s.d2.initiatives;
  const r1 = simulate1(e1);
  const r2 = simulate2(e1, e2, s.d2.push);
  const m = r2.m;
  const verdicts = judge(s.d1, s.d2, s.split);
  const notes = lessons(s.d1, s.d2, m.side.avgTopup);
  const res = outcome(m, s.d1, s.d2);
  const same = (p: (typeof PATHS)[number]) => JSON.stringify([...p.e1].sort()) === JSON.stringify([...e1].sort()) && JSON.stringify([...p.e2].sort()) === JSON.stringify([...e2].sort());

  return (
    <div className="pg-stack">
      <section className={`pg-outcome pg-outcome--${res.level}`}>
        <Caption level="1">Итоги двух месяцев</Caption>
        <Title level="2">{res.title}</Title>
        <Text>{res.text}</Text>
        <Text className="pg-outcome__reading">{reading(verdicts.find((v) => v.id === 'K4')!.status, e2, res.level)}</Text>
        {res.reasons.length > 0 && (
          <>
            <Text weight="2">Где потеряли</Text>
            <ul className="pg-list">{res.reasons.map((r) => <li key={r}><Text>{r}</Text></li>)}</ul>
          </>
        )}
        {res.level === 'frozen' && (
          <div className="pg-row pg-row--start">
            <Button size="m" mode="primary" appearance="negative" onClick={() => { if (confirm('Начать модуль заново? Ваши решения будут удалены.')) resetRun(); }}>Пройти модуль заново</Button>
            <Text>Разбор ниже покажет, где была развилка. Самостоятельную задачу можно решить и после заморозки.</Text>
          </div>
        )}
      </section>

      <Trace ids={['И4', 'Ф3', 'Э3']}>
        <Panel title="Метрики" icon={<Icon20StatisticsOutline />}>
          <div className="pg-grid pg-grid--2">
            <Line title="Активные цели, %" series={[
              { name: 'Прежняя аудитория', values: [baseline.old.m1, r1.m.old.m1, m.old.m1], tone: '#0059bf' },
              { name: 'Общий показатель', values: [baseline.old.m1, r1.m.total.m1, m.total.m1], tone: '#66adff', dash: true },
            ]} />
            <Line title="Цели с автопополнением, %" series={[
              { name: 'Прежняя аудитория', values: [baseline.old.m2, r1.m.old.m2, m.old.m2], tone: '#0059bf' },
              { name: 'Общий показатель', values: [baseline.old.m2, r1.m.total.m2, m.total.m2], tone: '#66adff', dash: true },
            ]} />
          </div>
          <SplitTable m={m} />
          <div className="pg-tiles">
            <Tile label="Обращения в поддержку" value={m.side.support} unit="" delta={m.side.support - 340} deltaUnit="" invert />
            <Tile label="Средняя сумма пополнения" value={m.side.avgTopup} unit=" ₽" delta={m.side.avgTopup - 2400} deltaUnit="₽" />
            <Tile label="Отписки от пушей" value={m.side.unsub} delta={m.side.unsub - 1.2} invert />
            {m.side.bonusCost > 0 && <Tile label="Расходы на баллы" value={m.side.bonusCost} digits={2} unit=" млн ₽/мес" />}
          </div>
        </Panel>
      </Trace>

      <Trace ids={['И4', 'Ф3']} note="Правила модели открыты участнику после прохождения: это ответ на эффект «казино».">
        <Panel title="Почему так вышло: правила модели открыты" icon={<Icon20SlidersOutline />} tone="pale">
          <Text>Пользователи делятся на пять сегментов с разными причинами не копить. Каждая инициатива меняет поведение конкретных сегментов на заданные величины. Правила одинаковы для всех: повторное прохождение той же ветки даёт тот же результат.</Text>
          <ol className="pg-rules">
            {[...r1.trace.map((t) => ({ ...t, when: 'Месяц 1' })), ...r2.trace.map((t) => ({ ...t, when: 'Месяц 2' }))].map((t, i) => (
              <li key={i}>
                <Pill tone="gray">{t.when}</Pill> <Text weight="2" className="pg-inline">{stripCode(t.label, codes)}</Text>
                <Text className="pg-muted">{t.deltas.map(([seg, da, dp]) => `${SEGMENT_INFO[seg].name}: активность ${da > 0 ? '+' : ''}${da}${dp ? `, автопополнение +${dp}` : ''}`).join(' · ')}</Text>
              </li>
            ))}
          </ol>
          <table className="pg-table pg-table--stack">
            <thead><tr><th>Сегмент</th><th>Доля: прежние / новые</th><th>Активность: старт → итог</th><th>Автопополнение: старт → итог</th></tr></thead>
            <tbody>
              {SEGMENTS.map((g) => (
                <tr key={g}>
                  <td><b>{SEGMENT_INFO[g].name}</b><br /><span className="pg-muted">{SEGMENT_INFO[g].why}</span></td>
                  <td data-label="Доля, прежние / новые">{MIX_OLD[g]}% / {MIX_PARTNER[g]}%</td>
                  <td data-label="Активность">{baseline.rates.active[g]}% → <b>{m.rates.active[g]}%</b> <Delta value={m.rates.active[g] - baseline.rates.active[g]} /></td>
                  <td data-label="Автопополнение">{baseline.rates.auto[g]}% → <b>{m.rates.auto[g]}%</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </Trace>

      <Trace ids={['И4', 'Ф3']} status="mock" note="Критерии «Действие ↔ сегмент», «Проверяемое ожидание» и «Разделение эффектов» оцениваются правилами. «Данные, а не мнения», «Пересмотр по последствиям» и «Ограничения и побочные эффекты» в MVP оценивает эвристика по тексту вместо ИИ-разбора, это помечено явно.">
        <Panel title="Разбор по критериям" icon={<Icon20CommentOutline />} aside={<Button mode="tertiary" size="s" onClick={() => navigate('/glossary')}>Словарь модуля</Button>}>
          <div className="pg-verdicts">
            {verdicts.map((v) => {
              const c = CRITERIA.find((x) => x.id === v.id)!;
              return (
                <article key={v.id} className={`pg-verdict pg-verdict--${v.status}`}>
                  <div className="pg-row">
                    <Headline level="2" weight="2">{code(critCode(v.id), c.title, codes)}</Headline>
                    <Pill tone={v.status === 'seen' ? 'green' : v.status === 'partial' ? 'amber' : v.status === 'unseen' ? 'pink' : 'gray'}>{STATUS_LABEL[v.status]}</Pill>
                  </div>
                  <Caption level="1" className="pg-muted">{c.what}</Caption>
                  <Text className="pg-verdict__evidence">{v.evidence}</Text>
                  <Text>{v.comment}</Text>
                  <Caption level="2" className="pg-muted">{c.by === 'rule' ? 'Оценено правилом по вашему выбору' : 'Предварительно: в MVP — эвристика по тексту, в целевой версии — ИИ-разбор по рубрике'}</Caption>
                  <Concept id={v.id} run={inRun(v.id, s.d1, s.d2, verdicts)} />
                </article>
              );
            })}
          </div>
        </Panel>
      </Trace>

      <Panel title="Допущения и подсказки" tone="pale">
        <Text><b>Что вы допускали и в чём не были уверены:</b> {s.d1.assumptions?.trim() || 'не записано'}</Text>
        <Text>{s.d1.assumptions?.trim()
          ? 'Хорошо, что сомнения названы: эксперты ищут именно их. Сверьте их с итогом двух месяцев: какое подтвердилось, а какое нет. Это готовый ответ на вопрос интервью.'
          : 'Допущений вы не записали. Эксперты ищут именно их: в следующий раз назовите, в каких данных сомневаетесь и что приняли без проверки.'}</Text>
        <Caption level="1" className="pg-muted">Подсказок взято: на решении 1 {s.hints.d1} из 3, на решении 2 {s.hints.d2} из 3.</Caption>
      </Panel>

      {notes.length > 0 && (
        <Panel title="Что стоит унести с собой" tone="tint">
          <ul className="pg-list">{notes.map((n) => <li key={n}><Text>{n}</Text></li>)}</ul>
        </Panel>
      )}

      {s.d1.alternative.trim() && (
        <Panel title="Ваша альтернатива" tone="pale">
          <Text className="pg-prewrap">{s.d1.alternative}</Text>
          <Caption level="1" className="pg-muted">Симуляция её не считает. Эксперт банка видит только самостоятельную работу — альтернативу можно обсудить на интервью.</Caption>
        </Panel>
      )}

      <Panel title="Как прошли бы другие ветки">
        <Text className="pg-muted">Сильный итог, от 30% автопополнения, есть только у путей с понятным автопереводом; без него потолок 24,9–27,0%. В эпизоде 2 сильнейший ход — гибкое пополнение: событие касается людей с нерегулярным доходом. Это «ответ автора» кейса, и мы его не прячем: на перенос навыка проверяет самостоятельная задача, а не угадывание этой ветки.</Text>
        <table className="pg-table pg-table--stack">
          <thead><tr><th>Ветка</th><th>Активные цели</th><th>С автопополнением</th><th>Средняя сумма</th></tr></thead>
          <tbody>
            <tr className="is-total"><td>Ваш путь</td><td data-label="Активные цели">{fmt(m.total.m1)}%</td><td data-label="С автопополнением">{fmt(m.total.m2)}%</td><td data-label="Средняя сумма">{fmt(m.side.avgTopup, 0)} ₽</td></tr>
            {PATHS.filter((p) => !same(p)).map((p) => {
              const r = simulate2(p.e1, p.e2, p.push).m;
              return <tr key={p.name}><td>{codes ? p.name : p.full}</td><td data-label="Активные цели">{fmt(r.total.m1)}%</td><td data-label="С автопополнением">{fmt(r.total.m2)}%</td><td data-label="Средняя сумма">{fmt(r.side.avgTopup, 0)} ₽</td></tr>;
            })}
          </tbody>
        </table>
      </Panel>

      <div className="pg-row pg-row--end">
        <Button size="l" after={<Icon20ChevronRight />} onClick={() => goStep('transfer')}>К самостоятельной задаче</Button>
      </div>
    </div>
  );
}
