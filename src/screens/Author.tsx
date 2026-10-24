import { useState } from 'react';
import { Button, Caption, Input, Text, Textarea, Title } from '@vkontakte/vkui';
import { applyOverride, currentOverride, reset, save, validate, type Override } from '../author';
import { Panel, Pill } from '../components/ui';
import { BackToProduct } from '../components/Shell';

export function Author() {
  const [draft, setDraft] = useState<Override>(() => currentOverride());
  const [advanced, setAdvanced] = useState(() => JSON.stringify({ effects: draft.effects, mixOld: draft.mixOld, mixPartner: draft.mixPartner }, null, 2));
  const [result, setResult] = useState<{ ok: boolean; lines: string[] } | null>(null);

  const setInit = (code: string, p: { title?: string; cost?: number }) =>
    setDraft((d) => ({ ...d, initiatives: { ...d.initiatives, [code]: { ...d.initiatives?.[code], ...p } } }));

  const check = () => {
    let adv: Partial<Override>;
    try {
      adv = JSON.parse(advanced);
    } catch {
      setResult({ ok: false, lines: ['В расширенных настройках ошибка JSON.'] });
      return;
    }
    const next = { ...draft, ...adv };
    applyOverride(next);
    const errors = validate();
    if (errors.length) setResult({ ok: false, lines: errors });
    else {
      save(next);
      setResult({ ok: true, lines: ['Проверки пройдены. Кейс сохранён в этом браузере и применяется к новым прохождениям.'] });
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ ...draft, ...JSON.parse(advanced) }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'polygon-case.json';
    a.click();
  };

  const importJson = async (file: File) => {
    const o = JSON.parse(await file.text()) as Override;
    setDraft(o);
    setAdvanced(JSON.stringify({ effects: o.effects, mixOld: o.mixOld, mixPartner: o.mixPartner }, null, 2));
  };

  return (
    <div className="pg-page pg-page--wide">
      <Caption level="1" className="pg-muted">Для автора кейса или организатора программы</Caption>
      <Title level="1" className="pg-page__title">Редактор кейса «Накопления на цель»</Title>
      <div><BackToProduct /></div>
      <Text className="pg-muted pg-page__lead">Прототип: правки хранятся в этом браузере, сервера и прав доступа нет. Перед сохранением кейс проходит те же проверки, что автотесты: доли сегментов, ёмкость команды, есть сильная и провальная ветка.</Text>

      <Panel title="Инициативы и стоимость в очках">
        <table className="pg-table">
          <thead><tr><th>Код</th><th>Название</th><th>Очки</th></tr></thead>
          <tbody>
            {Object.entries(draft.initiatives ?? {}).map(([code, i]) => (
              <tr key={code}>
                <td><Pill tone="gray">{code}</Pill></td>
                <td><Input value={i.title ?? ''} onChange={(e) => setInit(code, { title: e.target.value })} /></td>
                <td style={{ width: 96 }}><Input type="number" value={String(i.cost ?? 0)} onChange={(e) => setInit(code, { cost: Number(e.target.value) })} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="Реплики стейкхолдеров в досье">
        {Object.entries(draft.stakeholders ?? {}).map(([name, text]) => (
          <div key={name} className="pg-stack pg-stack--s">
            <Text weight="2">{name}</Text>
            <Textarea rows={2} value={text} onChange={(e) => setDraft((d) => ({ ...d, stakeholders: { ...d.stakeholders, [name]: e.target.value } }))} />
          </div>
        ))}
      </Panel>

      <Panel title="Расширенно: эффекты и доли сегментов (JSON)" tone="pale">
        <Caption level="1" className="pg-muted">Эффект — список [сегмент, изменение активности в п.п., изменение автопополнения в п.п.].</Caption>
        <Textarea rows={14} value={advanced} onChange={(e) => setAdvanced(e.target.value)} className="pg-mono" />
      </Panel>

      <Panel>
        <div className="pg-row pg-row--start">
          <Button size="l" onClick={check}>Проверить и сохранить</Button>
          <Button size="l" mode="secondary" onClick={exportJson}>Экспорт JSON</Button>
          <label className="pg-file">
            <input type="file" accept="application/json" onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
            <span>Импорт JSON</span>
          </label>
          <Button size="l" mode="tertiary" onClick={() => { reset(); location.reload(); }}>Сбросить к исходному</Button>
        </div>
        {result && (
          <div className={result.ok ? 'pg-positive' : 'pg-negative'}>
            {result.lines.map((l) => <Text key={l}>{l}</Text>)}
            {!result.ok && <Caption level="1" className="pg-muted">Кейс не сохранён. Исправьте и проверьте снова или сбросьте к исходному.</Caption>}
          </div>
        )}
      </Panel>
    </div>
  );
}
