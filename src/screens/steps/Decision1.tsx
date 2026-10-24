import { Button, Caption, FormItem, NativeSelect, Text, Textarea, Title } from '@vkontakte/vkui';
import { Icon20ChevronRight } from '@vkontakte/icons';
import { CAPACITY, E1_INITIATIVES, PROBLEMS, SEGMENT_CHOICES, type E1Id } from '../../sim/scenario';
import { cost1 } from '../../sim/engine';
import { goStep, setState, useStore, type Decision1 as D1 } from '../../store';
import { Trace } from '../../components/Trace';
import { Capacity, Panel, Pill } from '../../components/ui';
import { Choice, DecisionSummary, ExpectationFields } from '../../components/fields';
import { Ask } from '../../components/Ask';

const SOURCES = [
  ['Воронка', '56% открывших настройку автоперевода уходят без сохранения'],
  ['Ручные пополнения', 'во 2-й месяц пополнили только 42%, хотя у 70% бросивших деньги были'],
  ['Поддержка', '140 из 340 обращений — про автоперевод'],
  ['Опрос', 'n = 420, отклик 9%'],
  ['Стейкхолдеры', 'Ирина просит баллы'],
];

export function Decision1() {
  const s = useStore();
  const d = s.d1;
  const set = (p: Partial<D1>) => setState((st) => ({ d1: { ...st.d1, ...p } }));
  const used = cost1(d.initiatives);
  const toggle = (id: E1Id) => set({ initiatives: d.initiatives.includes(id) ? d.initiatives.filter((x) => x !== id) : [...d.initiatives, id] });
  const missing = [
    !d.problem && 'проблема',
    !d.segment && 'сегмент',
    d.initiatives.length === 0 && 'инициатива',
    d.rationale.replace(/\[[^\]]*\]/g, '').trim().length < 20 && 'обоснование своими словами',
  ].filter(Boolean) as string[];
  const valid = missing.length === 0 && used <= CAPACITY;

  if (s.d1Done)
    return (
      <div className="pg-stack pg-narrow">
        <DecisionSummary title="Решение 1 зафиксировано" d={d} />
        <Button size="l" after={<Icon20ChevronRight />} onClick={() => goStep('outcome1')}>К последствиям</Button>
      </div>
    );

  return (
    <div className="pg-grid pg-grid--side">
      <div className="pg-stack">
        <Trace ids={['И2', 'Ф1', 'Э2']}>
          <Panel>
            <Caption level="1" className="pg-muted">Эпизод 1 · Панель решения</Caption>
            <Title level="2">Что делаем в этом спринте</Title>
            <div className="pg-form2">
              <FormItem top="Проблема" noPadding>
                <NativeSelect value={d.problem} onChange={(e) => set({ problem: e.target.value })} placeholder="Какую проблему решаем">
                  {PROBLEMS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </NativeSelect>
              </FormItem>
              <FormItem top="Сегмент" noPadding>
                <NativeSelect value={d.segment} onChange={(e) => set({ segment: e.target.value })} placeholder="Для кого">
                  {SEGMENT_CHOICES.filter((c) => c.id !== 'newcomers').map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </NativeSelect>
              </FormItem>
              {d.problem === 'own' && (
                <FormItem top="Ваша формулировка проблемы" noPadding className="pg-span2">
                  <Textarea value={d.problemText} onChange={(e) => set({ problemText: e.target.value })} rows={2} />
                </FormItem>
              )}
              {d.segment === 'own' && (
                <FormItem top="Ваш сегмент" noPadding className="pg-span2">
                  <Textarea value={d.segmentText} onChange={(e) => set({ segmentText: e.target.value })} rows={2} />
                </FormItem>
              )}
            </div>
          </Panel>
        </Trace>

        <Panel title="Инициативы спринта" aside={<Capacity used={used} total={CAPACITY} />}>
          <div className="pg-choices">
            {E1_INITIATIVES.map((i) => (
              <Choice key={i.id} {...i} selected={d.initiatives.includes(i.id)} disabled={used + i.cost > CAPACITY} onClick={() => toggle(i.id)} />
            ))}
          </div>
          <Caption level="1" className="pg-muted">Можно взять одну или две инициативы в пределах 10 очков.</Caption>
        </Panel>

        <Panel title="Ожидаемое изменение">
          <ExpectationFields value={d} onChange={set} />
        </Panel>

        <Panel title="Обоснование">
          <div className="pg-chips">
            <Caption level="1" className="pg-muted">Сослаться на источник:</Caption>
            {SOURCES.map(([k, v]) => (
              <button key={k} type="button" className="pg-chip" onClick={() => set({ rationale: `${d.rationale}${d.rationale && !d.rationale.endsWith(' ') ? ' ' : ''}[${k}: ${v}] ` })}>{k}</button>
            ))}
          </div>
          <Textarea value={d.rationale} onChange={(e) => set({ rationale: e.target.value })} rows={6} placeholder="Почему именно эта проблема и эти действия? На какие данные опираетесь? Что может пойти не так?" />
          {s.notes.length > 0 && <Text className="pg-muted">Ваши вопросы из досье: {s.notes.join(' · ')}</Text>}
        </Panel>

        <Panel title="Что я допускаю и в чём не уверен (необязательно)">
          <Textarea value={d.assumptions ?? ''} onChange={(e) => set({ assumptions: e.target.value })} rows={3} placeholder="В каких данных сомневаетесь, что принимаете без проверки" />
          <Caption level="1" className="pg-muted">Названные сомнения не снижают оценку. В разборе к ним будет отдельный комментарий.</Caption>
        </Panel>

        <Trace ids={['И4']} status="mock" note="Симуляция не считает свои идеи участника — они сохраняются в разборе как альтернатива.">
          <Panel title="Своя идея (необязательно)" tone="pale">
            <Text className="pg-muted">Если хотите предложить то, чего нет в списке, — опишите. Симуляция не считает для неё цифры, но идея сохранится в вашем разборе. Её никто не оценивает.</Text>
            <Textarea value={d.alternative} onChange={(e) => set({ alternative: e.target.value })} rows={3} />
          </Panel>
        </Trace>
      </div>

      <aside className="pg-stack pg-sticky">
        <Ask step="d1" />
        <Trace ids={['И2']} note="Критерий 2: без действия или обоснования запись остаётся черновиком, текст не теряется.">
          <Panel tone={valid ? 'tint' : 'pale'}>
            <div className="pg-row"><Text weight="2">Статус</Text><Pill tone={valid ? 'green' : 'amber'}>{valid ? 'Готово к запуску' : 'Черновик'}</Pill></div>
            <Text className="pg-muted">{valid ? 'Решение будет сохранено и повлияет на следующий эпизод.' : `Не хватает: ${missing.join(', ')}${used > CAPACITY ? ', превышена ёмкость' : ''}. Черновик сохраняется автоматически.`}</Text>
            <Button size="l" stretched disabled={!valid} after={<Icon20ChevronRight />} onClick={() => { setState({ d1Done: true }); goStep('outcome1'); }}>
              Зафиксировать и запустить спринт
            </Button>
            <Caption level="1" className="pg-muted">После запуска решение 1 не меняется — его можно будет пересмотреть отдельной версией.</Caption>
          </Panel>
        </Trace>
      </aside>
    </div>
  );
}
