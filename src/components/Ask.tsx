import { Button, Caption, Text } from '@vkontakte/vkui';
import { Icon20LightbulbOutline } from '@vkontakte/icons';
import { HINT_QUESTIONS } from '../sim/scenario';
import { setState, useStore } from '../store';
import { Panel } from './ui';

/** Подсказка-вопрос: наводит, но не отвечает. Число взятых видно только в разборе кандидата. */
export function Ask({ step }: { step: 'd1' | 'd2' }) {
  const used = useStore().hints[step];
  const list = HINT_QUESTIONS[step];
  return (
    <Panel title="Подсказка" icon={<Icon20LightbulbOutline />} tone="pale">
      <Caption level="1" className="pg-muted">Подсказка задаёт вопрос, а ответ остаётся за вами. На этом шаге их {list.length}.</Caption>
      {list.slice(0, used).map((q) => <Text key={q} className="pg-callout">{q}</Text>)}
      <Button mode="secondary" size="m" disabled={used >= list.length} onClick={() => setState((st) => ({ hints: { ...st.hints, [step]: st.hints[step] + 1 } }))}>
        {used >= list.length ? 'Подсказки закончились' : 'Подсказка'}
      </Button>
      {used > 0 && <Caption level="1" className="pg-muted">Взято {used} из {list.length}</Caption>}
    </Panel>
  );
}
