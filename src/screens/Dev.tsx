import { Button, Caption, Text, Title } from '@vkontakte/vkui';
import { navigate } from '../router';
import { STEPS, exitJury, goStep, initial, setRole, setState, useStore, type State } from '../store';
import { homeOf } from '../components/Shell';
import { Panel } from '../components/ui';

// Скрытая панель для подготовки демо: #/dev или пять кликов по логотипу. Ссылок на неё нет.
export function Dev() {
  const s = useStore();
  const role = (r: State['role']) => { setRole(r); navigate(homeOf(r)); };
  return (
    <div className="pg-page">
      <Caption level="1" className="pg-muted">Только для команды</Caption>
      <Title level="1" className="pg-page__title">Панель разработчика</Title>
      <Text className="pg-muted">
        Роль: {s.role === 'candidate' ? 'кандидат' : s.role === 'expert' ? 'эксперт' : 'нет'} · режим жюри: {s.jury ? 'включён' : 'выключен'} · номер кандидата: {s.candidateId ? `№${s.candidateId}` : 'нет'} · шаг: {STEPS.find((x) => x.id === s.step)?.label}
      </Text>

      <Panel title="Роль">
        <div className="pg-row pg-row--start">
          <Button mode="secondary" size="m" onClick={() => role('candidate')}>Кандидат</Button>
          <Button mode="secondary" size="m" onClick={() => role('expert')}>Эксперт</Button>
          <Button mode="secondary" size="m" onClick={() => role(null)}>Без роли</Button>
        </div>
      </Panel>

      <Panel title="Перейти к шагу модуля">
        <div className="pg-row pg-row--start">
          {STEPS.map((x, i) => (
            <Button key={x.id} mode="secondary" size="m" onClick={() => { setRole('candidate'); goStep(x.id); navigate('/play'); }}>{i + 1}. {x.label}</Button>
          ))}
        </div>
      </Panel>

      <Panel title="Сброс">
        <div className="pg-row pg-row--start">
          <Button mode="secondary" size="m" disabled={!s.jury} onClick={exitJury}>Выйти из режима жюри</Button>
          <Button mode="secondary" size="m" onClick={() => setState({ reviews: {} })}>Заполнить работы эксперта заново</Button>
          <Button mode="primary" appearance="negative" size="m" onClick={() => { setState(initial); navigate('/'); }}>Сбросить весь прогресс</Button>
        </div>
        <Caption level="1" className="pg-muted">Работы эксперта заново: удаляются все сохранённые разборы, демо-работы возвращаются к исходному виду. Весь прогресс: как очистка данных сайта, вместе с режимом жюри и номером кандидата.</Caption>
      </Panel>
    </div>
  );
}
