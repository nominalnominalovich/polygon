import { Button, Caption, Text, Title } from '@vkontakte/vkui';
import { Icon20ArrowLeftOutline } from '@vkontakte/icons';
import { CONCEPTS, inRun } from '../sim/learning';
import { judge } from '../sim/debrief';
import { useStore } from '../store';
import { Concept } from '../components/Concept';

/** «Словарь модуля»: те же карточки понятий, что в разборе. */
export function Glossary() {
  const s = useStore();
  const verdicts = s.d2Done ? judge(s.d1, s.d2, s.split) : [];
  return (
    <div className="pg-page">
      <div><Button mode="tertiary" size="m" before={<Icon20ArrowLeftOutline />} onClick={() => window.history.back()}>Назад</Button></div>
      <Caption level="1" className="pg-muted">Модуль 1 · Накопления на цель</Caption>
      <Title level="1" className="pg-page__title">Словарь модуля</Title>
      <Text className="pg-muted pg-page__lead">Шесть понятий, которые тренирует модуль, по одному на критерий разбора. На интервью полезно называть их своими именами: так проще объяснить, что вы сделали и почему.</Text>
      {!s.d2Done && <Text className="pg-callout">Если вы ещё не прошли модуль, вернитесь сюда после разбора: понятия подсказывают, где в кейсе ловушки.</Text>}
      <div className="pg-glossary">
        {CONCEPTS.map((c) => <Concept key={c.id} id={c.id} criterion run={s.d2Done ? inRun(c.id, s.d1, s.d2, verdicts) : undefined} />)}
      </div>
    </div>
  );
}
