import { Caption, Text } from '@vkontakte/vkui';
import { CONCEPTS } from '../sim/learning';
import { CRITERIA, type CriterionId } from '../sim/debrief';

/** Карточка «Понятие»: название, суть, как проявилось у кандидата, где почитать. */
export function Concept({ id, run, criterion }: { id: CriterionId; run?: string; criterion?: boolean }) {
  const c = CONCEPTS.find((x) => x.id === id)!;
  return (
    <div className="pg-concept">
      <Caption level="1" className="pg-concept__label">Понятие{criterion && ` · критерий «${CRITERIA.find((x) => x.id === id)!.title}»`}</Caption>
      <Text weight="2">{c.title}</Text>
      <Text>{c.text}</Text>
      {run ? <Text><b>В вашем прохождении.</b> {run}</Text> : <Caption level="1" className="pg-muted">Как это проявилось у вас, покажет разбор модуля.</Caption>}
      <Caption level="1" className="pg-muted">Где почитать: {c.source}</Caption>
    </div>
  );
}
