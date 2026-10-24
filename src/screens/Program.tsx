import { Accordion, Button, Caption, Headline, Text, Title } from '@vkontakte/vkui';
import { Icon20LockOutline, Icon24PlayOutline } from '@vkontakte/icons';
import { navigate } from '../router';
import { STEPS, useStore } from '../store';
import { Trace } from '../components/Trace';
import { Pill } from '../components/ui';
import { PRESETS, loadPreset } from '../demo';

const LOCKED = [
  ['Удержание', '«Упало удержание на 8%»: найти причину по когортам'],
  ['Монетизация', 'Тарифы и A/B-тест: разобрать результат эксперимента'],
  ['Стейкхолдеры', 'Разработка, продажи и руководство хотят разного'],
];

export function Program() {
  const s = useStore();
  const progress = STEPS.findIndex((x) => x.id === s.reached);
  const started = s.d1.rationale || s.d1.initiatives.length || progress > 0;
  return (
    <div className="pg-page">
      <Caption level="1" className="pg-muted">Карьерная школа продакт-менеджеров · банк «Кварц»</Caption>
      <Title level="1" className="pg-page__title">Ваша программа</Title>
      <Text className="pg-muted pg-page__lead">Сначала тренировка — ошибаться можно и нужно. Потом самостоятельная задача; её видит эксперт банка, только если вы сами её передадите.</Text>

      <div className="pg-modules">
        <Trace ids={['И1', 'Ф1', 'Э1']}>
          <article className="pg-module pg-module--active">
            <div className="pg-module__top">
              <Pill tone="solid">Модуль 1</Pill>
              <Pill tone="blue">Тренировка + самостоятельная работа</Pill>
              <Caption level="1" className="pg-muted">≈ 45 минут</Caption>
            </div>
            <Title level="2">Накопления на цель</Title>
            <Text className="pg-muted">Цели создают охотно, но копят нерегулярно. Два связанных эпизода, разбор по шести критериям и задача на перенос навыка.</Text>
            <div className="pg-module__progress">
              {STEPS.map((x, i) => (
                <span key={x.id} className={`pg-module__dot ${i <= progress && started ? 'is-done' : ''}`} title={x.label} />
              ))}
              <Caption level="1" className="pg-muted">{started ? `Пройдено: ${STEPS[progress].label}` : 'Не начат'}</Caption>
            </div>
            <Button size="l" before={<Icon24PlayOutline />} onClick={() => navigate('/play')}>{started ? 'Продолжить' : 'Начать'}</Button>
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
          <div className="pg-modules__locked">
            {LOCKED.map(([t, d], i) => (
              <article key={t} className="pg-module pg-module--locked">
                <div className="pg-module__top"><Pill tone="gray">Модуль {i + 2}</Pill><Icon20LockOutline className="pg-muted" /></div>
                <Headline level="1" weight="2">{t}</Headline>
                <Text className="pg-muted">{d}</Text>
                <Caption level="1" className="pg-muted">{s.trace ? 'За границами MVP' : 'Скоро'}</Caption>
              </article>
            ))}
          </div>
        </Trace>
      </div>
    </div>
  );
}
