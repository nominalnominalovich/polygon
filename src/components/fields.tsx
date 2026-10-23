import type { ReactNode } from 'react';
import { FormItem, Input, NativeSelect, Text } from '@vkontakte/vkui';
import { E1_INITIATIVES, METRICS, PROBLEMS, SEGMENT_CHOICES, TERMS } from '../sim/scenario';
import type { Expectation } from '../store';
import { Pill } from './ui';

export function ExpectationFields({ value, onChange }: { value: Expectation; onChange: (p: Partial<Expectation>) => void }) {
  return (
    <div className="pg-expect">
      <FormItem top="Метрика" noPadding>
        <NativeSelect value={value.metric} onChange={(e) => onChange({ metric: e.target.value })} placeholder="Выберите">
          {METRICS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
        </NativeSelect>
      </FormItem>
      <FormItem top="Направление" noPadding>
        <div className="pg-seg" role="radiogroup" aria-label="Направление">
          {([['up', 'Рост ↑'], ['down', 'Снижение ↓']] as const).map(([v, l]) => (
            <button key={v} type="button" role="radio" aria-checked={value.dir === v} className={value.dir === v ? 'is-selected' : ''} onClick={() => onChange({ dir: v })}>{l}</button>
          ))}
        </div>
      </FormItem>
      <FormItem top="Величина" noPadding>
        <Input value={value.value} onChange={(e) => onChange({ value: e.target.value })} placeholder="например, +5 п.п." />
      </FormItem>
      <FormItem top="Срок" noPadding>
        <NativeSelect value={value.term} onChange={(e) => onChange({ term: e.target.value })} placeholder="Выберите">
          {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
        </NativeSelect>
      </FormItem>
    </div>
  );
}

export function Choice({ selected, disabled, onClick, code, title, text, cost, note, badge }: { selected: boolean; disabled?: boolean; onClick: () => void; code: string; title: string; text: string; cost: number; note?: string; badge?: ReactNode }) {
  return (
    <button type="button" className={`pg-choice ${selected ? 'is-selected' : ''}`} disabled={disabled && !selected} onClick={onClick} aria-pressed={selected}>
      <span className="pg-choice__code">{code}</span>
      <span className="pg-choice__body">
        <Text weight="2">{title} {badge}</Text>
        <Text className="pg-muted">{text}</Text>
        {note && <span className="pg-choice__note">{note}</span>}
      </span>
      <Pill tone={selected ? 'solid' : 'gray'}>{cost} оч.</Pill>
    </button>
  );
}

const label = <T extends { id: string; label: string }>(list: readonly T[], id: string) => list.find((x) => x.id === id)?.label ?? '—';

export function expectText(e: Expectation) {
  const metric = METRICS.find((m) => m.id === e.metric)?.label ?? '—';
  return `${metric} ${e.dir === 'up' ? '↑' : e.dir === 'down' ? '↓' : ''} ${e.value} · ${e.term || 'срок не указан'}`;
}

export function DecisionSummary({ title, d }: { title: string; d: import('../store').Decision1 }) {
  return (
    <section className="pg-panel pg-panel--pale">
      <header className="pg-panel__head"><Text weight="2" className="pg-panel__title">{title}</Text><Pill tone="gray">Версия 1</Pill></header>
      <dl className="pg-facts pg-facts--col">
        <div><dt>Проблема</dt><dd>{d.problem === 'own' ? d.problemText : label(PROBLEMS, d.problem)}</dd></div>
        <div><dt>Сегмент</dt><dd>{d.segment === 'own' ? d.segmentText : label(SEGMENT_CHOICES, d.segment)}</dd></div>
        <div><dt>Инициативы</dt><dd>{d.initiatives.map((id) => E1_INITIATIVES.find((i) => i.id === id)!).map((i) => `${i.code} · ${i.title}`).join('; ')}</dd></div>
        <div><dt>Ожидание</dt><dd>{expectText(d)}</dd></div>
        <div><dt>Обоснование</dt><dd className="pg-prewrap">{d.rationale}</dd></div>
      </dl>
    </section>
  );
}
