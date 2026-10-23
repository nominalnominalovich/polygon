import type { ReactNode } from 'react';
import { Caption, Headline, Text } from '@vkontakte/vkui';

export function Panel({ title, icon, aside, children, tone }: { title?: ReactNode; icon?: ReactNode; aside?: ReactNode; children: ReactNode; tone?: 'pale' | 'tint' | 'risk' | 'solid' }) {
  return (
    <section className={`pg-panel ${tone ? `pg-panel--${tone}` : ''}`}>
      {(title || aside) && (
        <header className="pg-panel__head">
          {icon && <span className="pg-panel__icon">{icon}</span>}
          {title && <Headline level="1" weight="2" className="pg-panel__title">{title}</Headline>}
          {aside && <div className="pg-panel__aside">{aside}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Pill({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'gray' | 'pink' | 'green' | 'solid' | 'amber' }) {
  return <span className={`pg-pill pg-pill--${tone}`}>{children}</span>;
}

export function fmt(n: number, digits = 1) {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: digits });
}

export function Delta({ value, unit = 'п.п.', invert = false }: { value: number; unit?: string; invert?: boolean }) {
  const v = Math.round(value * 10) / 10;
  if (v === 0) return <span className="pg-delta">0 {unit}</span>;
  const good = invert ? v < 0 : v > 0;
  return <span className={`pg-delta ${good ? 'pg-delta--up' : 'pg-delta--down'}`}>{v > 0 ? '+' : '−'}{fmt(Math.abs(v))} {unit}</span>;
}

export function Tile({ label, value, unit = '%', delta, deltaUnit, invert, hint, digits = 1 }: { label: string; value: number; unit?: string; delta?: number; deltaUnit?: string; invert?: boolean; hint?: string; digits?: number }) {
  return (
    <div className="pg-tile">
      <Caption level="1" className="pg-muted">{label}</Caption>
      <div className="pg-tile__value">{fmt(value, digits)}<span className="pg-tile__unit">{unit}</span></div>
      {delta !== undefined && <Delta value={delta} unit={deltaUnit} invert={invert} />}
      {hint && <Caption level="2" className="pg-muted pg-tile__hint">{hint}</Caption>}
    </div>
  );
}

export function Bars({ rows, max = 100, unit = '%', tone = 'blue' }: { rows: { label: string; value: number; note?: string }[]; max?: number; unit?: string; tone?: 'blue' | 'pink' }) {
  return (
    <div className="pg-bars">
      {rows.map((r) => (
        <div key={r.label} className="pg-bars__row">
          <Text className="pg-bars__label">{r.label}</Text>
          <div className="pg-bars__track">
            <div className={`pg-bars__fill pg-bars__fill--${tone}`} style={{ width: `${Math.min(100, (r.value / max) * 100)}%` }} />
          </div>
          <Text weight="2" className="pg-bars__value">{fmt(r.value, 0)}{unit}</Text>
        </div>
      ))}
    </div>
  );
}

export function Capacity({ used, total }: { used: number; total: number }) {
  const over = used > total;
  return (
    <div className="pg-capacity" aria-label={`Ёмкость: ${used} из ${total} очков`}>
      <div className="pg-capacity__cells">
        {Array.from({ length: Math.max(total, used) }, (_, i) => (
          <span key={i} className={`pg-capacity__cell ${i < used ? (i >= total ? 'is-over' : 'is-used') : ''}`} />
        ))}
      </div>
      <Text weight="2" className={over ? 'pg-negative' : ''}>{used} из {total} очков{over ? ' — превышена ёмкость' : ''}</Text>
    </div>
  );
}

export function Msg({ name, role, text, tone }: { name: string; role: string; text: ReactNode; tone?: 'warn' }) {
  return (
    <div className={`pg-msg ${tone === 'warn' ? 'pg-msg--warn' : ''}`}>
      <div className="pg-msg__avatar">{name[0]}</div>
      <div>
        <Text weight="2">{name} <span className="pg-muted pg-msg__role">· {role}</span></Text>
        <Text className="pg-msg__text">{text}</Text>
      </div>
    </div>
  );
}
