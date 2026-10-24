import { Button, Caption, FormItem, Input, Text, Textarea, Title } from '@vkontakte/vkui';
import { Icon20NewsfeedOutline, Icon20StatisticsOutline } from '@vkontakte/icons';
import { Icon20ChevronRight } from '@vkontakte/icons';
import { E4, E4_BASE, E4_CAPACITY, E4_EVENT, E4_EXPLANATIONS, type E4Id } from '../../sim/scenario';
import { simulateE4 } from '../../sim/engine';
import { CRITERIA } from '../../sim/debrief';
import { goStep, setState, useStore, type Transfer as T } from '../../store';
import { Trace } from '../../components/Trace';
import { Bars, Capacity, Delta, Msg, Panel, Pill, fmt } from '../../components/ui';
import { Radio } from './Decision2';
import { code, critCode, useCodes } from '../../labels';
import { Choice } from '../../components/fields';

export const E4_CRITERIA = CRITERIA;

export function Transfer() {
  const s = useStore();
  const codes = useCodes();
  const t = s.transfer;
  const set = (p: Partial<T>) => setState((st) => ({ transfer: { ...st.transfer, ...p } }));
  const used = t.initiatives.reduce((a, id) => a + E4.initiatives.find((i) => i.id === id)!.cost, 0);
  const toggle = (id: E4Id) => set({ initiatives: t.initiatives.includes(id) ? t.initiatives.filter((x) => x !== id) : [...t.initiatives, id] });
  const valid = t.problem.trim() && t.segment.trim() && t.initiatives.length > 0 && t.expectation.trim() && t.rationale.trim() && used <= E4_CAPACITY;

  if (s.transferDone && s.transfer2Done)
    return (
      <div className="pg-stack pg-narrow">
        <Panel tone="tint" title="Самостоятельная работа отправлена"><Text>Изменить её уже нельзя — так работа остаётся сопоставимой.</Text></Panel>
        <Button size="l" after={<Icon20ChevronRight />} onClick={() => goStep('card')}>К карточке результата</Button>
      </div>
    );
  if (s.transferDone) return <TransferMonth />;

  return (
    <div className="pg-grid pg-grid--side">
      <div className="pg-stack">
        <Trace ids={['И5', 'Ф4', 'Э4']} note="Критерий 1: задача не повторяет разобранный ответ, условия и критерии видны до начала.">
          <Panel tone="risk">
            <div className="pg-row"><Pill tone="solid">Самостоятельная работа</Pill><Caption level="1">без подсказок · отправляется один раз</Caption></div>
            <Title level="2">{E4.product}</Title>
            <Text>{E4.intro}</Text>
          </Panel>
        </Trace>
        <Panel title="Что известно">
          <ul className="pg-list">{E4.facts.map((f) => <li key={f}><Text>{f}</Text></li>)}</ul>
          <Caption level="1" className="pg-muted">{E4.survey.note} n = {E4.survey.n}, отклик {E4.survey.response}%.</Caption>
          <Bars rows={E4.survey.answers} max={40} />
        </Panel>
        <Panel title="Ваше решение">
          <div className="pg-form2">
            <FormItem top="Проблема" noPadding><Input value={t.problem} onChange={(e) => set({ problem: e.target.value })} placeholder="Своими словами" /></FormItem>
            <FormItem top="Сегмент" noPadding><Input value={t.segment} onChange={(e) => set({ segment: e.target.value })} placeholder="Для кого" /></FormItem>
          </div>
        </Panel>
        <Panel title="Инициативы" aside={<Capacity used={used} total={E4_CAPACITY} />}>
          <div className="pg-choices">
            {E4.initiatives.map((i) => <Choice key={i.id} {...i} selected={t.initiatives.includes(i.id)} disabled={used + i.cost > E4_CAPACITY} onClick={() => toggle(i.id)} />)}
          </div>
        </Panel>
        <Panel title="Ожидание и обоснование">
          <FormItem top="Ожидаемое изменение: метрика, величина, срок" noPadding><Input value={t.expectation} onChange={(e) => set({ expectation: e.target.value })} /></FormItem>
          <FormItem top="Обоснование" noPadding><Textarea value={t.rationale} onChange={(e) => set({ rationale: e.target.value })} rows={5} /></FormItem>
          <FormItem top="Что проверить после запуска" noPadding><Textarea value={t.check} onChange={(e) => set({ check: e.target.value })} rows={2} /></FormItem>
        </Panel>
      </div>
      <aside className="pg-stack pg-sticky">
        <Panel title="Критерии — видны до начала" tone="pale">
          <Caption level="1" className="pg-muted">«Разделение эффектов» и «пересмотр» оцениваются по шагу «месяц спустя».</Caption>
          <ul className="pg-list">{E4_CRITERIA.map((c) => <li key={c.id}><Text weight="2">{code(critCode(c.id), c.title, codes)}</Text><Caption level="1" className="pg-muted">{c.what}</Caption></li>)}</ul>
        </Panel>
        <Trace ids={['И5']} note="Критерий 2: работа отделена от тренировки; передача эксперту — отдельное действие на следующем шаге.">
          <Panel tone={valid ? 'tint' : 'pale'}>
            <Text className="pg-muted">Дальше — «месяц спустя»: увидите результат и коротко пересмотрите решение. Тренировочный маршрут эксперт не увидит, эту работу — только если вы её передадите.</Text>
            <Button size="l" stretched disabled={!valid} after={<Icon20ChevronRight />} onClick={() => { setState({ transferDone: true }); window.scrollTo({ top: 0 }); }}>Зафиксировать решение</Button>
          </Panel>
        </Trace>
      </aside>
    </div>
  );
}

function TransferMonth() {
  const s = useStore();
  const t = s.transfer;
  const set = (p: Partial<T>) => setState((st) => ({ transfer: { ...st.transfer, ...p } }));
  const r = simulateE4(t.initiatives);
  const valid = !!t.explanation && (t.changeText ?? '').trim().length > 0;
  return (
    <div className="pg-stack">
      <Trace ids={['И5', 'Ф4', 'Э4']} note="Задача на перенос проверяет и ключевой навык модуля: отделить эффект своего решения от внешнего события (К4) и пересмотреть решение (К5).">
        <Panel tone="risk">
          <div className="pg-row"><Pill tone="solid">Самостоятельная работа · месяц спустя</Pill><Caption level="1">без подсказок</Caption></div>
          <Title level="2">Ваше решение вышло. Посмотрите, что случилось</Title>
        </Panel>
      </Trace>
      <div className="pg-grid pg-grid--2">
        <Panel title="Новость" icon={<Icon20NewsfeedOutline />} tone="risk">
          <Text weight="2">{E4_EVENT.title}</Text>
          <Text>{E4_EVENT.text}</Text>
        </Panel>
        <Panel title="Дашборд" icon={<Icon20StatisticsOutline />}>
          <div className="pg-tile">
            <Caption level="1" className="pg-muted">Доля отключений в первый месяц</Caption>
            <div className="pg-tile__value">{fmt(r.total)}<span className="pg-tile__unit">%</span></div>
            <Delta value={r.total - E4_BASE} invert />
            <Caption level="2" className="pg-muted">было {E4_BASE}%</Caption>
          </div>
          <Msg name="Ирина" role="Руководитель направления" tone={r.total >= E4_BASE ? 'warn' : undefined} text={r.total >= E4_BASE ? 'Отключений не меньше, чем было. Ваше решение не сработало?' : 'Снизилось, но меньше, чем ждали. Почему?'} />
        </Panel>
      </div>
      <Panel title="Разбивка по причинам отключения" aside={!t.split && <Button mode="secondary" size="m" onClick={() => set({ split: true })}>Запросить разбивку</Button>}>
        {t.split ? (
          <div className="pg-table-wrap"><table className="pg-table">
            <thead><tr><th>Причина</th><th>До, п.п.</th><th>После, п.п.</th></tr></thead>
            <tbody>
              {r.rows.map((x) => <tr key={x.id}><td>{x.label}</td><td>{fmt(x.base)}</td><td><b>{fmt(x.after)}</b> <Delta value={x.after - x.base} invert /></td></tr>)}
              <tr className="is-total"><td>Всего</td><td>{E4_BASE}</td><td><b>{fmt(r.total)}</b></td></tr>
            </tbody>
          </table></div>
        ) : <Text className="pg-muted">Общий показатель складывает разные причины. Разбивка открывается одним действием.</Text>}
      </Panel>
      <Panel title="Как вы объясняете результат?">
        <Radio options={E4_EXPLANATIONS} value={t.explanation ?? ''} onChange={(id) => set({ explanation: id })} />
        {t.explanation === 'own' && <Textarea value={t.explanationText ?? ''} onChange={(e) => set({ explanationText: e.target.value })} rows={2} />}
        <FormItem top="Что меняете в решении и почему (2–3 предложения)" noPadding>
          <Textarea value={t.changeText ?? ''} onChange={(e) => set({ changeText: e.target.value })} rows={3} />
        </FormItem>
        <Button size="l" disabled={!valid} after={<Icon20ChevronRight />} onClick={() => { setState({ transfer2Done: true }); goStep('card'); }}>Отправить работу</Button>
      </Panel>
    </div>
  );
}
