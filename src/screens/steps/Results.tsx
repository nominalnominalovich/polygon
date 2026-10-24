import { Button, Caption, NativeSelect, Text, Title } from '@vkontakte/vkui';
import { Icon20ChevronRight } from '@vkontakte/icons';
import { E4 } from '../../sim/scenario';
import { CRITERIA, STATUS_LABEL, judge, type CriterionId, type Status } from '../../sim/debrief';
import { skillResults } from '../../sim/learning';
import { goStep, setState, useStore, type Review } from '../../store';
import { navigate } from '../../router';
import { Panel, Pill } from '../../components/ui';
import { code, critCode, useCodes } from '../../labels';
import { WorkFields } from './Card';

const TONE: Record<Status, 'green' | 'amber' | 'pink' | 'gray'> = { seen: 'green', partial: 'amber', unseen: 'pink', nodata: 'gray' };

/** Самопроверка после отправки самостоятельной работы: ориентиры автора и оценка себя по тем же критериям. */
export function SelfCheck() {
  const s = useStore();
  const codes = useCodes();
  const rate = (id: CriterionId, st: Status) => setState((x) => ({ selfReview: { ...x.selfReview, criteria: { ...x.selfReview.criteria, [id]: st } } }));
  return (
    <div className="pg-grid pg-grid--side">
      <div className="pg-stack">
        <Panel tone="tint">
          <div className="pg-row"><Pill tone="solid">Самопроверка</Pill><Caption level="1">работа уже отправлена</Caption></div>
          <Title level="2">Сравните работу с ориентирами автора кейса</Title>
          <Text>Изменить работу уже нельзя. Прочитайте, что автор считает сильным решением, и оцените себя по тем же шести критериям, по которым её разберёт эксперт.</Text>
        </Panel>
        <Panel title="Ориентиры автора кейса">
          <ul className="pg-list">{E4.strongSigns.map((x) => <li key={x}><Text>{x}</Text></li>)}</ul>
        </Panel>
        <Panel title="Ваша работа" tone="pale">
          <WorkFields t={s.transfer} />
        </Panel>
        <Panel title="Ваша самооценка">
          {CRITERIA.map((c) => (
            <div key={c.id} className="pg-review-row">
              <Text weight="2">{code(critCode(c.id), c.title, codes)}</Text>
              <Caption level="1" className="pg-muted">{c.what}</Caption>
              <NativeSelect value={s.selfReview.criteria[c.id] ?? ''} placeholder="Как вы себя оцениваете" onChange={(e) => rate(c.id, e.target.value as Status)} aria-label={`Самооценка: ${c.title}`}>
                {(Object.keys(STATUS_LABEL) as Status[]).map((k) => <option key={k} value={k}>{STATUS_LABEL[k]}</option>)}
              </NativeSelect>
            </div>
          ))}
        </Panel>
      </div>
      <aside className="pg-stack pg-sticky">
        <Panel tone="pale">
          <Text>Эксперт вашу самооценку не увидит. Когда он разберёт работу, обе оценки появятся рядом в карточке.</Text>
          <Button size="l" stretched after={<Icon20ChevronRight />} onClick={() => { setState((x) => ({ selfReview: { ...x.selfReview, done: true } })); goStep('card'); }}>К карточке результата</Button>
          <Caption level="1" className="pg-muted">Самооценку можно пропустить: оставьте поля пустыми.</Caption>
        </Panel>
      </aside>
    </div>
  );
}

/** Итог модуля в карточке: самооценка рядом с оценкой эксперта и «Что у вас получилось». Разбор эксперта передаёт карточка. */
export function ModuleResults({ review }: { review?: Review }) {
  const s = useStore();
  const codes = useCodes();
  const self = s.selfReview.criteria;
  const skills = skillResults(judge(s.d1, s.d2, s.split));
  const expert = (id: CriterionId) => {
    if (!review?.savedAt) return s.shared ? 'ждёт разбора' : 'работа не передана';
    const st = review.criteria[id]?.status;
    return st ? STATUS_LABEL[st] : '—';
  };
  return (
    <>
      {Object.keys(self).length > 0 && (
        <Panel title="Ваша самооценка и оценка эксперта" tone="pale">
          <div className="pg-table-wrap"><table className="pg-table">
            <thead><tr><th>Критерий</th><th>Вы</th><th>Эксперт</th></tr></thead>
            <tbody>
              {CRITERIA.map((c) => (
                <tr key={c.id}><td>{code(critCode(c.id), c.title, codes)}</td><td>{self[c.id] ? STATUS_LABEL[self[c.id]!] : '—'}</td><td>{expert(c.id)}</td></tr>
              ))}
            </tbody>
          </table></div>
          {!review?.savedAt && <Caption level="1" className="pg-muted">Оценка эксперта появится здесь, когда он разберёт работу. Самооценку видите только вы.</Caption>}
        </Panel>
      )}
      <Panel title="Что у вас получилось" tone="tint">
        <Caption level="1" className="pg-muted">По разбору тренировки. Самостоятельную работу оценивает эксперт.</Caption>
        {skills.map((k) => (
          <div key={k.name} className="pg-skill">
            <div className="pg-row"><Text weight="2">{k.name}</Text><Pill tone={TONE[k.status]}>{STATUS_LABEL[k.status]}</Pill></div>
            <Caption level="1" className="pg-muted">{k.learn}</Caption>
            <Text>{k.tip}</Text>
          </div>
        ))}
        <Button mode="link" onClick={() => navigate('/glossary')}>Словарь модуля</Button>
      </Panel>
    </>
  );
}
