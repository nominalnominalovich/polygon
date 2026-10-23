import { createContext, useContext, useState, type ReactNode } from 'react';
import { Button, Caption, Headline, Text, Title } from '@vkontakte/vkui';
import { Icon20Cancel } from '@vkontakte/icons';
import { CHAINS, TRACE } from '../sim/trace';
import { useStore } from '../store';
import { navigate } from '../router';

type Open = { ids: string[]; status: 'real' | 'mock'; note?: string } | null;
const Ctx = createContext<(o: Open) => void>(() => {});

export function TraceProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<Open>(null);
  return (
    <Ctx.Provider value={setOpen}>
      {children}
      {open && <TraceModal open={open} onClose={() => setOpen(null)} />}
    </Ctx.Provider>
  );
}

/** Обёртка над блоком интерфейса: в режиме обоснования показывает, какие истории и фичи он реализует. */
export function Trace({ ids, status = 'real', note, children }: { ids: string[]; status?: 'real' | 'mock'; note?: string; children: ReactNode }) {
  const { trace } = useStore();
  const setOpen = useContext(Ctx);
  if (!trace) return <>{children}</>;
  return (
    <div className={`pg-trace pg-trace--${status}`}>
      <div className="pg-trace__chips">
        {ids.map((id) => (
          <button key={id} className="pg-trace__chip" onClick={() => setOpen({ ids, status, note })}>{id}</button>
        ))}
        <span className={`pg-trace__status pg-trace__status--${status}`}>{status === 'real' ? 'Реализовано' : 'Имитируется'}</span>
      </div>
      {children}
    </div>
  );
}

function TraceModal({ open, onClose }: { open: NonNullable<Open>; onClose: () => void }) {
  const story = open.ids.find((id) => id.startsWith('И'));
  const chain = story ? CHAINS[story] : open.ids;
  const s = story ? TRACE[story] : null;
  return (
    <div className="pg-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="pg-modal__card" onClick={(e) => e.stopPropagation()}>
        <div className="pg-modal__head">
          <Title level="3">Почему этот блок такой</Title>
          <button className="pg-iconbtn" aria-label="Закрыть" onClick={onClose}><Icon20Cancel /></button>
        </div>
        <Caption level="1" className="pg-muted">Цепочка обоснования: гипотеза → потребность → история → фича → экран</Caption>
        <ol className="pg-chain">
          {chain.map((id) => {
            const t = TRACE[id];
            if (!t) return null;
            return (
              <li key={id} className={`pg-chain__item pg-chain__item--${t.kind}`}>
                <span className="pg-chain__id">{t.id}</span>
                <div>
                  <Text weight="2">{t.title}</Text>
                  <Text className="pg-muted">{t.text}</Text>
                </div>
              </li>
            );
          })}
        </ol>
        {s?.criteria && (
          <div className="pg-modal__criteria">
            <Headline level="2" weight="2">Критерии приёмки {s.id}</Headline>
            <ul>{s.criteria.map((c) => <li key={c}><Text>{c}</Text></li>)}</ul>
          </div>
        )}
        <Text className={open.status === 'real' ? 'pg-positive' : 'pg-amber'}>
          {open.status === 'real' ? 'В MVP это реализовано и работает.' : 'В MVP это имитируется.'} {open.note}
        </Text>
        <div className="pg-modal__actions">
          <Button mode="secondary" size="m" onClick={() => { onClose(); navigate(`/defense/${story ? 'stories' : 'features'}`); }}>Открыть в материалах защиты</Button>
          <Button mode="primary" size="m" onClick={onClose}>Понятно</Button>
        </div>
      </div>
    </div>
  );
}
