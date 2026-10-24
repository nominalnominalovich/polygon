import { Button, Caption, Headline, Text, Title } from '@vkontakte/vkui';
import { Icon20ChevronRight, Icon20NewsfeedOutline, Icon20StatisticsOutline, Icon24DoneOutline } from '@vkontakte/icons';
import { E1_INITIATIVES, EVENT, RESEARCH_REVEAL, SEGMENT_INFO } from '../../sim/scenario';
import { baseline, hasResearch, partnerBaseline, simulate1, type Month } from '../../sim/engine';
import { goStep, setState, useStore } from '../../store';
import { Trace } from '../../components/Trace';
import { Delta, Msg, Panel, Pill, Tile, fmt } from '../../components/ui';
import { HINTS, code, useCodes } from '../../labels';
import { Hint } from '../../components/Hint';

export function SplitTable({ m, base = baseline }: { m: Month; base?: Month }) {
  const rows = [
    ['Прежняя аудитория', '10 000 целей', m.old, base.old, 'к старту'],
    ['Пришли по партнёрству', '4 000 целей', m.partner!, partnerBaseline, 'к тому, как эта группа копила бы без ваших релизов'],
    ['Общий показатель', '14 000 целей', m.total, base.old, 'к старту — так видит руководитель'],
  ] as const;
  return (
    <div className="pg-table-wrap"><table className="pg-table">
      <thead><tr><th>Аудитория</th><th>Объём</th><th>Активные цели</th><th>С автопополнением</th></tr></thead>
      <tbody>
        {rows.map(([name, n, c, b, note]) => (
          <tr key={name} className={name === 'Общий показатель' ? 'is-total' : ''}>
            <td>{name}<br /><Caption level="2" className="pg-muted">{note}</Caption></td>
            <td className="pg-muted">{n}</td>
            <td><b>{fmt(c.m1)}%</b> <Delta value={c.m1 - b.m1} /></td>
            <td><b>{fmt(c.m2)}%</b> <Delta value={c.m2 - b.m2} /></td>
          </tr>
        ))}
      </tbody>
    </table></div>
  );
}

export function Outcome1() {
  const s = useStore();
  const codes = useCodes();
  const e1 = s.d1.initiatives;
  const { m } = simulate1(e1);
  const research = hasResearch(e1);
  const showSplit = s.split || research;
  const releases = E1_INITIATIVES.filter((i) => e1.includes(i.id));

  return (
    <div className="pg-stack">
      <Panel tone="solid">
        <Caption level="1">Прошёл месяц</Caption>
        <Title level="2">Ваш релиз вышел. Одновременно случилось то, о чём вы не знали</Title>
      </Panel>

      <Trace ids={['И3', 'Ф2', 'Э3']} note="Критерий 1: последствия выбора и внешнее событие показаны раздельно.">
        <div className="pg-grid pg-grid--2">
          <Panel title="Что вышло из вашего релиза" icon={<Icon24DoneOutline />}>
            <ul className="pg-list">
              {releases.map((i) => (
                <li key={i.id}>
                  <Text weight="2">{code(i.code, i.title, codes)}</Text>
                  <Text className="pg-muted">
                    {i.id === 'A' && 'Комплаенс согласовал баллы только к середине месяца — эффект неполный.'}
                    {i.id === 'B' && 'Напоминания уходят раз в неделю всем, у кого нет автопополнения.'}
                    {i.id === 'V' && 'Новый экран автоперевода: дата и сумма списания, порог «не списывать», отмена в один тап.'}
                    {i.id === 'G' && 'Проведено 5 интервью и размечены 340 обращений. Результаты ниже.'}
                  </Text>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Что изменилось вокруг" icon={<Icon20NewsfeedOutline />} tone="risk">
            <Text weight="2">{EVENT.title}</Text>
            <Text>{EVENT.text}</Text>
          </Panel>
        </div>
      </Trace>

      <Panel title="Дашборд направления — как его видит руководитель" icon={<Icon20StatisticsOutline />}>
        <div className="pg-tiles">
          <Tile label="Активные цели" info={HINTS.M1} value={m.total.m1} delta={m.total.m1 - baseline.old.m1} hint="было 37,2%" />
          <Tile label="Цели с автопополнением" info={HINTS.M2} value={m.total.m2} delta={m.total.m2 - baseline.old.m2} hint="было 18%" />
          <Tile label="Обращения в поддержку" info={HINTS.M3} value={m.side.support} unit="" delta={m.side.support - 340} deltaUnit="" invert hint="было 340" />
          {e1.includes('A') && <Tile label="Средняя сумма пополнения" value={m.side.avgTopup} unit=" ₽" delta={m.side.avgTopup - 2400} deltaUnit="₽" hint={`баллы: ${fmt(m.side.bonusCost, 2)} млн ₽/мес`} />}
          {e1.includes('B') && <Tile label="Отписки от пушей" value={m.side.unsub} delta={m.side.unsub - 1.2} invert hint="было 1,2%" />}
        </div>
        <Caption level="1" className="pg-muted">Общий показатель по всем новым целям месяца — {fmt(14000, 0)}.</Caption>
      </Panel>

      <Panel title="Сообщения">
        <div className="pg-stack pg-stack--s">
          {m.total.m2 < 18 && <Msg name="Ирина" role="Руководитель направления" tone="warn" text={e1.includes('A') ? 'Автопополнение упало, хотя баллы уже запущены! Что сломалось?' : 'Автопополнение упало! Что сломалось? Давай срочно баллы.'} />}
          {m.total.m2 >= 18 && m.total.m2 < 25 && <Msg name="Ирина" role="Руководитель направления" text={e1.includes('A') ? 'Ждали больше. Может, баллов мало?' : 'Ждали больше. Может, всё-таки баллы?'} />}
          {m.total.m2 >= 25 && <Msg name="Ирина" role="Руководитель направления" text="Неплохо. Что дальше?" />}
          {e1.includes('B') && <Msg name="Олег" role="Маркетинг" tone="warn" text="Отписки от пушей выросли с 1,2 до 2,0%. Нужно решение по частоте." />}
          {e1.includes('A') && <Msg name="Артём" role="Тимлид" text="Баллы запустились только в середине месяца. На поддержку программы уйдёт 3 очка следующего спринта." />}
        </div>
      </Panel>

      <Trace ids={['И3', 'Ф2']} note="Срез открывается одним действием; если было исследование — включён сразу.">
        <Panel title={<>Срез по аудиториям <Hint text={HINTS.split} /></>} aside={!showSplit && <Button mode="secondary" size="m" onClick={() => setState({ split: true })}>Запросить срез у аналитика</Button>}>
          {showSplit ? (
            <>
              <SplitTable m={m} />
              {research && <Caption level="1" className="pg-muted">Срез доступен сразу: его подготовили по итогам вашего исследования.</Caption>}
            </>
          ) : (
            <Text className="pg-muted">Общий дашборд складывает разные аудитории. Чтобы понять, что дал именно ваш релиз, запросите срез.</Text>
          )}
        </Panel>
      </Trace>

      {research && (
        <Panel title="Итоги исследования" tone="pale">
          <Headline level="2" weight="2">Почему не настраивают автопополнение (по интервью и обращениям)</Headline>
          <div className="pg-reveal">
            {RESEARCH_REVEAL.split.map((r) => (
              <div key={r.seg} className="pg-reveal__item"><b>{r.approx}</b><Text>{SEGMENT_INFO[r.seg].name}</Text><Caption level="1" className="pg-muted">{r.level} · {SEGMENT_INFO[r.seg].why}</Caption></div>
            ))}
          </div>
          <Caption level="1" className="pg-amber">{RESEARCH_REVEAL.caveat}</Caption>
          <Text>{RESEARCH_REVEAL.bias}</Text>
          <blockquote>{RESEARCH_REVEAL.quote}</blockquote>
        </Panel>
      )}

      <div className="pg-row pg-row--end">
        <Pill tone="gray">Решение 1 сохранено и учтено</Pill>
        <Button size="l" after={<Icon20ChevronRight />} onClick={() => goStep('decision2')}>Пересмотреть решение</Button>
      </div>
    </div>
  );
}
