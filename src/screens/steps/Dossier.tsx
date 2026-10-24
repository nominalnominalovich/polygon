import { useState } from 'react';
import { Button, Caption, Headline, Input, Tabs, TabsItem, Text, Title } from '@vkontakte/vkui';
import { Icon20ChevronRight, Icon20InfoCircleOutline, Icon20LightbulbOutline } from '@vkontakte/icons';
import { CONSTRAINTS, FUNNEL, MANUAL, REVIEWS, STAKEHOLDERS, SUPPORT_QUOTES, SURVEY, UNKNOWNS } from '../../sim/scenario';
import { goStep, setState, useStore } from '../../store';
import { Trace } from '../../components/Trace';
import { Bars, Msg, Panel, Pill, fmt } from '../../components/ui';

const TABS = [
  ['funnel', 'Воронка'],
  ['support', 'Обращения'],
  ['survey', 'Опрос'],
  ['reviews', 'Отзывы'],
  ['people', 'Стейкхолдеры'],
  ['limits', 'Ограничения'],
] as const;

export function Dossier() {
  const s = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number][0]>('funnel');
  const [note, setNote] = useState('');
  return (
    <div className="pg-grid pg-grid--side">
      <div className="pg-stack">
        <Trace ids={['И1', 'Ф1', 'Э1']}>
          <Panel tone="tint">
            <div className="pg-brief">
              <div>
                <Caption level="1" className="pg-muted">Эпизод 1 из 2 · Досье продукта</Caption>
                <Title level="2">«Цели» в приложении банка «Кварц»</Title>
                <Text>Руководитель направления просит за спринт поднять регулярность накоплений. Подготовьте предложение: какую проблему решаем, для кого, что делаем и какого результата ждём.</Text>
                <Text weight="2" className="pg-callout">Через два месяца автопополнение по всем целям направления должно быть не ниже 18%, иначе проект заморозят.</Text>
              </div>
              <dl className="pg-facts">
                <div><dt>Ваша роль</dt><dd>Младший продакт команды «Целей»</dd></div>
                <div><dt>Режим</dt><dd><Pill tone="blue">Тренировка</Pill></dd></div>
                <div><dt>Ёмкость</dt><dd>10 очков на спринт</dd></div>
                <div><dt>Сейчас</dt><dd>Активных целей 37,2% · с автопополнением 18% · 340 обращений в месяц</dd></div>
              </dl>
            </div>
          </Panel>
        </Trace>

        <Panel>
          <Tabs mode="secondary" className="pg-tabs">
            {TABS.map(([id, label]) => (
              <TabsItem key={id} id={`tab-${id}`} aria-controls="dossier-tabbody" selected={tab === id} onClick={() => setTab(id)}>{label}</TabsItem>
            ))}
          </Tabs>
          <div className="pg-tabbody" id="dossier-tabbody" role="tabpanel" aria-labelledby={`tab-${tab}`}>
            {tab === 'funnel' && (
              <>
                <Headline level="1" weight="2">Новые цели за месяц: путь к автопополнению</Headline>
                <Bars max={10000} unit="" rows={FUNNEL.map((f) => ({ label: f.label, value: f.value }))} />
                <Text className="pg-callout">Из открывших настройку автоперевода <b>56% ушли без сохранения</b>.</Text>
                <Headline level="1" weight="2">Ручные пополнения</Headline>
                <Bars max={5000} unit="" rows={[{ label: 'Пополнили вручную в 1-й месяц', value: MANUAL.month1 }, { label: 'Из них пополнили во 2-й месяц', value: MANUAL.month2 }]} />
                <Text className="pg-callout">У {MANUAL.moneyWasThere}% тех, кто не пополнил во 2-й месяц, в день зарплаты на карте было больше их обычного пополнения.</Text>
              </>
            )}
            {tab === 'support' && (
              <>
                <Headline level="1" weight="2">340 обращений по «Целям» за месяц, 140 — про автоперевод</Headline>
                <Bars max={340} unit="" rows={[{ label: 'Про автоперевод', value: 140 }, { label: 'Другое', value: 200 }]} />
                <div className="pg-quotes">{SUPPORT_QUOTES.map((q) => <blockquote key={q}>{q}</blockquote>)}</div>
              </>
            )}
            {tab === 'survey' && (
              <>
                <Headline level="1" weight="2">«Почему не настроили автопополнение?»</Headline>
                <Caption level="1" className="pg-muted">Опрос после создания цели · n = {SURVEY.n} · отклик {SURVEY.response}%</Caption>
                <Bars rows={SURVEY.answers} max={40} />
              </>
            )}
            {tab === 'reviews' && (
              <div className="pg-quotes">
                {REVIEWS.map((r) => (
                  <blockquote key={r.text}><span className="pg-stars" aria-label={`${r.stars} из 5`}>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</span> {r.text}</blockquote>
                ))}
              </div>
            )}
            {tab === 'people' && <div className="pg-stack pg-stack--s">{STAKEHOLDERS.map((p) => <Msg key={p.name} {...p} />)}</div>}
            {tab === 'limits' && <ul className="pg-list">{CONSTRAINTS.map((c) => <li key={c}><Text>{c}</Text></li>)}</ul>}
          </div>
        </Panel>
      </div>

      <aside className="pg-stack">
        <Trace ids={['И1']} note="Критерий 2: отсутствующая информация обозначена как неизвестная.">
          <Panel title="Что неизвестно" icon={<Icon20InfoCircleOutline />} tone="pale">
            <ul className="pg-list">{UNKNOWNS.map((u) => <li key={u}><Text>{u}</Text></li>)}</ul>
            <Caption level="1" className="pg-muted">Пробел — не факт. Запишите вопрос или допущение, оно попадёт в ваше решение.</Caption>
            <form className="pg-note-form" onSubmit={(e) => { e.preventDefault(); if (note.trim()) { setState({ notes: [...s.notes, note.trim()] }); setNote(''); } }}>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Например: что ещё нужно узнать о клиентах?" />
              <Button type="submit" mode="secondary" size="m">Записать</Button>
            </form>
            {s.notes.length > 0 && (
              <ul className="pg-notes">{s.notes.map((n, i) => <li key={i}><Icon20LightbulbOutline /> <Text>{n}</Text></li>)}</ul>
            )}
          </Panel>
        </Trace>
        <Panel>
          <Text className="pg-muted">Смотрите все вкладки: источники противоречат друг другу, и это нормально.</Text>
          <Button size="l" stretched after={<Icon20ChevronRight />} onClick={() => goStep('decision1')}>К решению</Button>
          <Caption level="1" className="pg-muted">{fmt(10000, 0)} новых целей в месяц · данные вымышлены</Caption>
        </Panel>
      </aside>
    </div>
  );
}
