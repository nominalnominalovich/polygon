import { useState } from 'react';
import { Button, Caption, Text, Title } from '@vkontakte/vkui';
import { setState } from '../store';

const STEPS = {
  candidate: [
    { title: 'Вы — младший продакт банка «Кварц»', text: 'Модуль «Накопления на цель» занимает около 45 минут. Вы ведёте настоящий по ощущениям сервис: данные, коллеги, ограничения команды. Банк, люди и цифры вымышлены.' },
    { title: 'Что предстоит', text: 'Изучить досье → принять решение на спринт → увидеть, что случилось через месяц → пересмотреть решение → получить разбор → решить новую задачу самостоятельно. Решения сохраняются и влияют на следующий шаг.' },
    { title: 'Как оценивается', text: 'Баллов нет. Разбор показывает, опирались ли вы на данные, выбрали ли действие под конкретную группу клиентов, можно ли проверить ваше ожидание и смогли ли вы отличить эффект своего решения от внешних изменений. Проиграть можно: проект могут заморозить.' },
    { title: 'Кто увидит вашу работу', text: 'Тренировку не видит никто. Самостоятельную задачу эксперт банка увидит, только если вы сами её передадите. Решений о найме по ней не принимают — это материал для интервью.' },
  ],
  expert: [
    { title: 'Откуда приходят работы', text: 'Финалисты программы проходят тренировку, затем решают самостоятельную задачу и сами решают, передать ли её вам. Тренировочные черновики к вам не попадают.' },
    { title: 'Как разбирать', text: 'По каждому из шести критериев поставьте статус и запишите один вопрос для интервью. Комментарий к фрагменту работы — по желанию. «Недостаточно данных» — нормальный статус.' },
    { title: 'Почему нет балла', text: 'Карточка — материал для разговора с кандидатом, а не решение о найме. Сводка по потоку сверху показывает, сколько работ ждёт разбора и сколько времени он занимает.' },
  ],
};

export function Tour({ role, onClose }: { role: 'candidate' | 'expert'; onClose: () => void }) {
  const [i, setI] = useState(0);
  const steps = STEPS[role];
  const done = () => { setState((s) => ({ tours: { ...s.tours, [role]: true } })); onClose(); };
  return (
    <div className="pg-modal" role="dialog" aria-modal="true" aria-label="Как это устроено">
      <div className="pg-modal__card pg-tour">
        <Caption level="1" className="pg-muted">Как это устроено · {i + 1} из {steps.length}</Caption>
        <Title level="2">{steps[i].title}</Title>
        <Text>{steps[i].text}</Text>
        <div className="pg-tour__dots">{steps.map((_, k) => <span key={k} className={k === i ? 'is-on' : ''} />)}</div>
        <div className="pg-modal__actions">
          <Button mode="tertiary" size="m" onClick={done}>Пропустить</Button>
          {i > 0 && <Button mode="secondary" size="m" onClick={() => setI(i - 1)}>Назад</Button>}
          {i < steps.length - 1 ? <Button size="m" onClick={() => setI(i + 1)}>Дальше</Button> : <Button size="m" onClick={done}>Начать</Button>}
        </div>
      </div>
    </div>
  );
}
