import { Button, Caption, Text, Title } from '@vkontakte/vkui';
import { Icon20UserStarOutline } from '@vkontakte/icons';
import { E4, E4_BASE, E4_EXPLANATIONS } from '../../sim/scenario';
import { simulateE4 } from '../../sim/engine';
import { STATUS_LABEL } from '../../sim/debrief';
import { setState, useStore } from '../../store';
import { navigate } from '../../router';
import { Trace } from '../../components/Trace';
import { Panel, Pill } from '../../components/ui';
import { E4_CRITERIA } from './Transfer';

export const OWN_WORK_ID = 'me';

export function WorkFields({ t }: { t: import('../../store').Transfer }) {
  return (
    <dl className="pg-facts pg-facts--col">
      <div><dt>Проблема</dt><dd>{t.problem}</dd></div>
      <div><dt>Сегмент</dt><dd>{t.segment}</dd></div>
      <div><dt>Инициативы</dt><dd>{t.initiatives.map((id) => { const i = E4.initiatives.find((x) => x.id === id)!; return `${i.code} · ${i.title}`; }).join('; ')}</dd></div>
      <div><dt>Ожидание</dt><dd>{t.expectation}</dd></div>
      <div><dt>Обоснование</dt><dd className="pg-prewrap">{t.rationale}</dd></div>
      {t.check && <div><dt>Проверить после запуска</dt><dd>{t.check}</dd></div>}
      {t.explanation && (
        <>
          <div><dt>Месяц спустя: результат</dt><dd>Доля отключений {E4_BASE}% → {simulateE4(t.initiatives).total.toLocaleString('ru-RU')}% · разбивка по причинам: {t.split ? 'запрошена' : 'не запрошена'}</dd></div>
          <div><dt>Объяснение</dt><dd>{t.explanation === 'own' ? t.explanationText : E4_EXPLANATIONS.find((x) => x.id === t.explanation)?.label}</dd></div>
          <div><dt>Что меняет и почему</dt><dd className="pg-prewrap">{t.changeText}</dd></div>
        </>
      )}
    </dl>
  );
}

export function Card() {
  const s = useStore();
  const review = s.reviews[OWN_WORK_ID];
  return (
    <div className="pg-grid pg-grid--side">
      <div className="pg-stack">
        <Trace ids={['И5', 'И6', 'Ф4', 'Э5']}>
          <Panel>
            <div className="pg-row">
              <Caption level="1" className="pg-muted">Итоговая карточка · {E4.product}</Caption>
              <Pill tone={review?.savedAt ? 'green' : s.shared ? 'blue' : 'gray'}>{review?.savedAt ? 'Разбор эксперта получен' : s.shared ? 'Ожидает разбора' : 'Не передана'}</Pill>
            </div>
            <Title level="2">Ваша самостоятельная работа</Title>
            <WorkFields t={s.transfer} />
          </Panel>
        </Trace>
        {review?.savedAt && (
          <Panel title="Комментарий эксперта" tone="tint">
            {E4_CRITERIA.map((c) => {
              const r = review.criteria[c.id];
              return r ? <div key={c.id} className="pg-review-row"><Text weight="2">{c.id.replace('K', 'К')} · {c.title}: {STATUS_LABEL[r.status]}</Text><Text>{r.comment}</Text></div> : null;
            })}
            {review.question && <Text><b>Вопрос на интервью:</b> {review.question}</Text>}
          </Panel>
        )}
      </div>
      <aside className="pg-stack">
        <Trace ids={['И5', 'И6']} note="Передача — отдельное действие участника; тренировочные черновики не передаются.">
          <Panel title="Передача эксперту банка" tone={s.shared ? 'tint' : 'pale'}>
            <Text><b>Уйдёт:</b> условия задачи, ваше решение, обоснование, ожидание.</Text>
            <Text><b>Не уйдёт:</b> тренировочные эпизоды, черновики, разбор.</Text>
            {s.shared ? (
              <>
                <Pill tone="green">Передано</Pill>
                <Button mode="secondary" size="m" onClick={() => setState({ shared: false })}>Отозвать</Button>
              </>
            ) : (
              <Button size="l" stretched onClick={() => setState({ shared: true })}>Передать работу эксперту</Button>
            )}
          </Panel>
        </Trace>
        <Panel tone="pale">
          <Text className="pg-muted">Для демонстрации: посмотрите, как эту карточку увидит эксперт банка.</Text>
          <Button mode="outline" size="m" before={<Icon20UserStarOutline />} onClick={() => { setState({ role: 'expert' }); navigate(`/expert/${OWN_WORK_ID}`); }}>Открыть как эксперт</Button>
        </Panel>
      </aside>
    </div>
  );
}
