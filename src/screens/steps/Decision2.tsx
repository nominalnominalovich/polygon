import { Button, Caption, FormItem, Text, Textarea, Title } from '@vkontakte/vkui';
import { Icon20ChevronRight } from '@vkontakte/icons';
import { EXPLANATIONS, type E2Id } from '../../sim/scenario';
import { available2, capacity2, cost2, hasResearch, simulate1 } from '../../sim/engine';
import { goStep, setState, useStore, type Decision2 as D2 } from '../../store';
import { Trace } from '../../components/Trace';
import { Capacity, Panel, Pill, Tile } from '../../components/ui';
import { Choice, DecisionSummary, ExpectationFields, expectText } from '../../components/fields';
import { SplitTable } from './Outcome1';

export function Radio({ options, value, onChange }: { options: readonly { id: string; label: string }[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="pg-radio" role="radiogroup">
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} className={`pg-radio__item ${value === o.id ? 'is-selected' : ''}`} onClick={() => onChange(o.id)}>
          <span className="pg-radio__dot" />
          <Text>{o.label}</Text>
        </button>
      ))}
    </div>
  );
}

export function Decision2() {
  const s = useStore();
  const d = s.d2;
  const e1 = s.d1.initiatives;
  const set = (p: Partial<D2>) => setState((st) => ({ d2: { ...st.d2, ...p } }));
  const cap = capacity2(e1);
  const used = cost2(d.initiatives);
  const options = available2(e1);
  const m1 = simulate1(e1).m;
  const needPush = e1.includes('B') && !d.initiatives.includes('EB');

  const toggle = (id: E2Id) => {
    if (id === 'I') return set({ initiatives: d.initiatives.includes('I') ? [] : ['I'] });
    const rest = d.initiatives.filter((x) => x !== 'I');
    set({ initiatives: rest.includes(id) ? rest.filter((x) => x !== id) : [...rest, id] });
  };

  const missing = [
    !d.explanation && 'объяснение дашборда',
    needPush && !d.push && 'решение по частоте пушей',
    d.initiatives.length === 0 && 'действие',
    !d.changeText.trim() && 'что меняете и почему',
  ].filter(Boolean) as string[];
  const valid = missing.length === 0 && used <= cap;

  if (s.d2Done)
    return (
      <div className="pg-grid pg-grid--2">
        <DecisionSummary title="Решение 1" d={s.d1} />
        <Panel title="Решение 2 зафиксировано" tone="tint" aside={<Pill tone="solid">Версия 2</Pill>}>
          <Text><b>Что изменили:</b> {d.changeText}</Text>
          <Text><b>Ожидание:</b> {expectText(d)}</Text>
          <Button size="l" after={<Icon20ChevronRight />} onClick={() => goStep('debrief')}>К разбору</Button>
        </Panel>
      </div>
    );

  return (
    <div className="pg-grid pg-grid--side-left">
      <aside className="pg-stack">
        <Trace ids={['И3', 'Ф2', 'Э2']} note="Критерий 2: первая версия решения сохраняется и видна рядом.">
          <DecisionSummary title="Ваше решение 1" d={s.d1} />
        </Trace>
        <Panel title="Итог месяца 1" tone="pale">
          <div className="pg-tiles pg-tiles--2">
            <Tile label="M1 общий" value={m1.total.m1} delta={m1.total.m1 - 37.2} />
            <Tile label="M2 общий" value={m1.total.m2} delta={m1.total.m2 - 18} />
          </div>
          {s.split || hasResearch(e1) ? <SplitTable m={m1} /> : (
            <Button mode="secondary" size="m" stretched onClick={() => setState({ split: true })}>Запросить срез по аудиториям</Button>
          )}
        </Panel>
      </aside>

      <div className="pg-stack">
        <Panel>
          <Caption level="1" className="pg-muted">Эпизод 2 · Пересмотр решения</Caption>
          <Title level="2">Как вы объясняете изменение общего дашборда?</Title>
          <Radio options={EXPLANATIONS} value={d.explanation} onChange={(id) => { set({ explanation: id }); if (id === 'insufficient') setState({ split: true }); }} />
          {d.explanation === 'insufficient' && <Text className="pg-positive">Срез по аудиториям открыт слева.</Text>}
          {d.explanation === 'own' && <Textarea value={d.explanationText} onChange={(e) => set({ explanationText: e.target.value })} rows={3} placeholder="Ваше объяснение" />}
        </Panel>

        {needPush && (
          <Panel title="Маркетинг ждёт решения по частоте пушей" tone="risk">
            <Radio options={[{ id: 'keep', label: 'Оставить раз в неделю' }, { id: 'cut', label: 'Сократить до раза в две недели' }]} value={d.push ?? ''} onChange={(id) => set({ push: id as D2['push'] })} />
            <Caption level="1" className="pg-muted">Или возьмите доработку «Е-Б · умные напоминания» ниже — она заменяет этот выбор.</Caption>
          </Panel>
        )}

        <Panel title="Что делаете в этом спринте" aside={<Capacity used={used} total={cap} />}>
          {cap < 10 && <Text className="pg-amber">3 очка заняты поддержкой программы баллов — обязательство из эпизода 1.</Text>}
          <div className="pg-choices">
            {options.map((i) => (
              <Choice key={i.code} {...i} selected={d.initiatives.includes(i.id)} disabled={i.id !== 'I' && (d.initiatives.includes('I') || used + i.cost > cap)} onClick={() => toggle(i.id)}
                badge={i.requires ? <Pill tone="blue">доработка вашего решения</Pill> : undefined} />
            ))}
          </div>
        </Panel>

        <Panel title="Что меняете по сравнению с решением 1 и почему">
          <Textarea value={d.changeText} onChange={(e) => set({ changeText: e.target.value })} rows={4} placeholder="Сошлитесь на то, что произошло за месяц: какие метрики и у какой аудитории" />
        </Panel>

        <Panel title="Новое ожидаемое изменение">
          <ExpectationFields value={d} onChange={set} />
          <FormItem top="Дополнительное обоснование (необязательно)" noPadding>
            <Textarea value={d.rationale} onChange={(e) => set({ rationale: e.target.value })} rows={3} />
          </FormItem>
        </Panel>

        <Panel tone={valid ? 'tint' : 'pale'}>
          <div className="pg-row"><Text weight="2">Статус</Text><Pill tone={valid ? 'green' : 'amber'}>{valid ? 'Готово' : 'Черновик'}</Pill></div>
          {!valid && <Text className="pg-muted">Не хватает: {missing.join(', ')}{used > cap ? ', превышена ёмкость' : ''}.</Text>}
          <Button size="l" disabled={!valid} after={<Icon20ChevronRight />} onClick={() => { setState({ d2Done: true }); goStep('debrief'); }}>Зафиксировать версию 2 и перейти к итогам</Button>
        </Panel>
      </div>
    </div>
  );
}
