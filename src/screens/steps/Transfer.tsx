import { Button, Caption, FormItem, Input, Text, Textarea, Title } from '@vkontakte/vkui';
import { Icon20ChevronRight } from '@vkontakte/icons';
import { E4, E4_CAPACITY, type E4Id } from '../../sim/scenario';
import { CRITERIA } from '../../sim/debrief';
import { goStep, setState, useStore, type Transfer as T } from '../../store';
import { Trace } from '../../components/Trace';
import { Bars, Capacity, Panel, Pill } from '../../components/ui';
import { Choice } from '../../components/fields';

export const E4_CRITERIA = CRITERIA.filter((c) => ['K1', 'K2', 'K3', 'K6'].includes(c.id));

export function Transfer() {
  const s = useStore();
  const t = s.transfer;
  const set = (p: Partial<T>) => setState((st) => ({ transfer: { ...st.transfer, ...p } }));
  const used = t.initiatives.reduce((a, id) => a + E4.initiatives.find((i) => i.id === id)!.cost, 0);
  const toggle = (id: E4Id) => set({ initiatives: t.initiatives.includes(id) ? t.initiatives.filter((x) => x !== id) : [...t.initiatives, id] });
  const valid = t.problem.trim() && t.segment.trim() && t.initiatives.length > 0 && t.expectation.trim() && t.rationale.trim() && used <= E4_CAPACITY;

  if (s.transferDone)
    return (
      <div className="pg-stack pg-narrow">
        <Panel tone="tint" title="Самостоятельная работа отправлена"><Text>Изменить её уже нельзя — так работа остаётся сопоставимой.</Text></Panel>
        <Button size="l" after={<Icon20ChevronRight />} onClick={() => goStep('card')}>К карточке результата</Button>
      </div>
    );

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
          <ul className="pg-list">{E4_CRITERIA.map((c) => <li key={c.id}><Text weight="2">{c.id.replace('K', 'К')} · {c.title}</Text><Caption level="1" className="pg-muted">{c.what}</Caption></li>)}</ul>
        </Panel>
        <Trace ids={['И5']} note="Критерий 2: работа отделена от тренировки; передача эксперту — отдельное действие на следующем шаге.">
          <Panel tone={valid ? 'tint' : 'pale'}>
            <Text className="pg-muted">Тренировочный маршрут эксперт не увидит. Эту работу — только если вы её передадите.</Text>
            <Button size="l" stretched disabled={!valid} after={<Icon20ChevronRight />} onClick={() => { setState({ transferDone: true }); goStep('card'); }}>Отправить работу</Button>
          </Panel>
        </Trace>
      </aside>
    </div>
  );
}
