import { useState } from 'react';
import { Accordion, Button, Caption, Text, Title } from '@vkontakte/vkui';
import { Icon20LockOutline, Icon24PlayOutline } from '@vkontakte/icons';
import { navigate } from '../router';
import { STEPS, goStep, useStore } from '../store';
import { Trace } from '../components/Trace';
import { Pill } from '../components/ui';
import { PRESETS, loadPreset } from '../demo';
import { SKILLS } from '../sim/learning';

const MODULES = [
  {
    title: 'Накопления на цель',
    text: 'Клиенты банка «Кварц» охотно создают цели накоплений, но копят нерегулярно. Вы младший продакт: два спринта решений, последствия каждого и разбор по шести критериям. В конце самостоятельная задача на перенос навыка.',
    learn: SKILLS.map((k) => k.learn),
  },
  {
    title: 'Удержание',
    text: 'Удержание подписки «Кварц Плюс» за квартал упало на 8%, и на планёрке уже винят новый тариф. У вас есть когорты по месяцам подключения, причины отказов и календарь акций. Нужно понять, что произошло, прежде чем что-то менять.',
    learn: ['Найти причину падения удержания по когортам и отличить сезонность от проблемы продукта'],
  },
  {
    title: 'Монетизация',
    text: 'Команда провела A/B-тест новой цены подписки: выручка на пользователя выросла, а подключений стало меньше. Маркетинг хочет раскатить цену на всех, финансы просят подождать. Вам решать, что на самом деле показал эксперимент.',
    learn: ['Прочитать результат A/B-теста целиком, вместе с сопутствующими метриками, и решить, раскатывать ли изменение'],
  },
  {
    title: 'Стейкхолдеры',
    text: 'Продажи пообещали крупному клиенту функцию к концу месяца, разработка просит спринт на технический долг, а руководство ждёт роста выручки. Спринт один, всем сразу не успеть. Нужно выбрать, что делать, и объяснить отказ тем, кому откажете.',
    learn: ['Выбрать между запросами разных сторон по данным и цели продукта и объяснить отказ так, чтобы его приняли'],
  },
];

export function Program() {
  const s = useStore();
  const progress = STEPS.findIndex((x) => x.id === s.reached);
  const started = !!(s.d1.rationale || s.d1.initiatives.length || progress > 0);
  const done = s.reached === 'card';
  const status = (i: number) => (i > 0 ? 'Скоро' : done ? 'Пройден' : started ? `В процессе: шаг ${progress + 1} из ${STEPS.length}` : 'Не начат');
  // В витрине начатый модуль, а если такого нет, первый.
  const [sel, setSel] = useState(() => Math.max(0, MODULES.findIndex((_, i) => status(i).startsWith('В процессе'))));
  const m = MODULES[sel];
  const open = sel === 0;
  const action = done ? 'Открыть итоги' : started ? `Продолжить с шага ${progress + 1}` : 'Начать';
  const go = () => { if (started) goStep(done ? 'card' : s.reached); navigate('/play'); };
  return (
    <div className="pg-page">
      <Caption level="1" className="pg-muted">Карьерная школа продакт-менеджеров · банк «Кварц»</Caption>
      <Title level="1" className="pg-page__title">Ваша программа</Title>
      <Text className="pg-muted pg-page__lead">Сначала тренировка — ошибаться можно и нужно. Потом самостоятельная задача; её видит эксперт банка, только если вы сами её передадите.</Text>

      <div className="pg-modules">
        <Trace ids={['И1', 'Ф1', 'Э1']} status={open ? 'real' : 'mock'} note={open ? undefined : 'Модули 2–4 за границами MVP: есть только описание.'}>
          <article className="pg-module pg-module--active">
            <div className="pg-module__top">
              <Pill tone={open ? 'solid' : 'gray'}>Модуль {sel + 1}</Pill>
              <Pill tone="blue">Тренировка + самостоятельная работа</Pill>
              <Caption level="1" className="pg-muted">около 45 минут</Caption>
            </div>
            <Title level="2">{m.title}</Title>
            <Text className="pg-muted">{m.text}</Text>
            <div className="pg-showcase__learn">
              <Text weight="2">Чему научит</Text>
              {m.learn.length > 1 ? <ul className="pg-list">{m.learn.map((x) => <li key={x}><Text>{x}</Text></li>)}</ul> : <Text>{m.learn[0]}</Text>}
            </div>
            {open && (
              <div className="pg-module__progress">
                {STEPS.map((x, i) => (
                  <span key={x.id} className={`pg-module__dot ${i <= progress && started ? 'is-done' : ''}`} title={x.label} />
                ))}
                <Caption level="1" className="pg-muted">{status(0)}</Caption>
              </div>
            )}
            <div className="pg-row pg-row--start">
              <Button size="l" disabled={!open} before={open ? <Icon24PlayOutline /> : <Icon20LockOutline />} onClick={go}>{open ? action : 'Начать'}</Button>
              {!open && <Caption level="1" className="pg-muted">Откроется после модуля 1</Caption>}
              {open && s.d2Done && <Button mode="tertiary" size="l" onClick={() => navigate('/glossary')}>Словарь модуля</Button>}
            </div>
          </article>
        </Trace>
        {s.jury && (
        <div className="pg-demo-acc"><Accordion>
            <Accordion.Summary>Для защиты проекта: готовые прохождения (раскрывают ответы)</Accordion.Summary>
            <Accordion.Content>
              <div className="pg-demo-acc__body">
                <Text className="pg-muted">Решения уже заполнены примером — сразу к последствиям месяца 1. Решение 2 подставлено, его можно изменить перед фиксацией. Если проходите модуль впервые, не открывайте.</Text>
                <div className="pg-presets">
                  {PRESETS.map((p) => (
                    <button key={p.id} type="button" className="pg-preset" onClick={() => { loadPreset(p.id); navigate('/play'); }}>
                      <Text weight="2">{p.title}</Text>
                      <Caption level="1" className="pg-muted">{p.text}</Caption>
                    </button>
                  ))}
                </div>
              </div>
            </Accordion.Content>
          </Accordion></div>
        )}
        <Trace ids={['И1']} status="mock" note="Библиотека модулей — за границами MVP (карта историй, нижняя строка).">
          <div className="pg-modrow">
            {MODULES.map((x, i) => (
              <button key={x.title} type="button" className={`pg-modcard ${i === sel ? 'is-selected' : ''}`} aria-pressed={i === sel} onClick={() => setSel(i)}>
                <Caption level="1" className="pg-muted">Модуль {i + 1}</Caption>
                <Text weight="2">{x.title}</Text>
                <Pill tone={i > 0 ? 'gray' : done ? 'green' : started ? 'blue' : 'gray'}>{status(i)}</Pill>
              </button>
            ))}
          </div>
        </Trace>
      </div>
    </div>
  );
}
