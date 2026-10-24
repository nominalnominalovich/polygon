import { useEffect } from 'react';
import { Button, Caption, Headline, Switch, Text, Title } from '@vkontakte/vkui';
import { Icon20ArrowLeftOutline, Icon20DocumentOutline, Icon20DownloadOutline, Icon20FullscreenOutline, Icon20UserStarOutline, Icon20ViewOutline, Icon24EducationOutline } from '@vkontakte/icons';
import { navigate } from '../router';
import { setRole, setState, useStore } from '../store';
import { PRESETS, loadPreset } from '../demo';
import { Panel } from '../components/ui';
import { homeOf } from '../components/Shell';

const BASE = import.meta.env.BASE_URL;

const TEAM = ['Мария П.', 'Ольга Ф.', 'Софа И.', 'Роман С.'];

const STEPS = [
  ['Глазами кандидата', 'Войдите как кандидат и пройдите досье и первое решение. Так продукт видит участник программы.'],
  ['Включите режим обоснования', 'На каждом блоке появятся метки историй, фич и экранов. Клик по метке показывает цепочку «гипотеза → потребность → история → фича → экран».'],
  ['Готовое прохождение', 'Чтобы не заполнять поля, откройте один из готовых путей ниже: сильный, ловушку баллов или путь через исследование.'],
  ['Глазами эксперта банка', 'Войдите как эксперт: работы кандидатов по статусам, разбор по шести критериям, сводка по потоку.'],
];

export function Jury() {
  const { trace, role } = useStore();
  useEffect(() => { setState({ jury: true }); }, []);
  return (
    <div className="pg-page pg-page--wide">
      <Caption level="1" className="pg-muted">Учебный проект ВШЭ · «Принципы и подходы к разработке цифровых продуктов» · 2026</Caption>
      <Title level="1" className="pg-page__title">Полигон — материалы для жюри</Title>
      <div><Button mode="secondary" size="m" before={<Icon20ArrowLeftOutline />} onClick={() => navigate(homeOf(role))}>Вернуться в продукт</Button></div>
      <Text className="pg-muted pg-page__lead">Всё в одном месте: продукт, отчёт, презентация и как их смотреть. Служебные элементы — метки обоснования и готовые прохождения — видны только в этом режиме, участник программы их не видит.</Text>

      <div className="pg-grid pg-grid--2">
        <Panel title="Материалы">
          <div className="pg-jury-links">
            <Button size="l" before={<Icon20DocumentOutline />} onClick={() => navigate('/defense')}>Отчёт на сайте</Button>
            <Button size="l" mode="secondary" before={<Icon20FullscreenOutline />} href={`${BASE}files/Poligon.pdf`} target="_blank">Презентация</Button>
            <Button size="l" mode="secondary" before={<Icon20DownloadOutline />} href={`${BASE}files/report.pdf`} target="_blank">Отчёт PDF</Button>
            <Button size="l" mode="secondary" before={<Icon20DownloadOutline />} href={`${BASE}files/report.docx`}>Отчёт DOCX</Button>
            <Button size="l" mode="secondary" before={<Icon20DownloadOutline />} href={`${BASE}files/Poligon.pptx`}>Презентация PPTX</Button>
            <Button size="l" mode="secondary" before={<Icon20DownloadOutline />} href={`${BASE}files/canvas-report.pdf`} target="_blank">Канва 01–10 PDF</Button>
            <Button size="l" mode="tertiary" onClick={() => navigate('/author')}>Редактор кейса</Button>
            <Button size="l" mode="tertiary" href="https://github.com/nominalnominalovich/polygon" target="_blank">Код на GitHub</Button>
          </div>
          <a className="pg-doc__badge" href="https://github.com/nominalnominalovich/polygon/actions/workflows/deploy.yml" target="_blank" rel="noreferrer">
            <img src="https://github.com/nominalnominalovich/polygon/actions/workflows/deploy.yml/badge.svg" alt="Статус сборки и автотестов" height="20" />
          </a>
        </Panel>
        <Panel title="Команда">
          <ul className="pg-team">
            {TEAM.map((n) => <li key={n}><Text weight="2">{n}</Text></li>)}
          </ul>
        </Panel>
      </div>

      <Panel title="Как посмотреть продукт за 5 минут">
        <ol className="pg-jury-steps">
          {STEPS.map(([t, d]) => <li key={t}><Headline level="2" weight="2">{t}</Headline><Text className="pg-muted">{d}</Text></li>)}
        </ol>
        <div className="pg-row">
          <label className="pg-trace-toggle">
            <Icon20ViewOutline />
            <span>Режим обоснования</span>
            <Switch checked={trace} onChange={(e) => setState({ trace: e.currentTarget.checked })} aria-label="Режим обоснования" />
          </label>
          <div className="pg-hero__actions">
            <Button size="l" before={<Icon24EducationOutline />} onClick={() => { setRole('candidate'); navigate('/program'); }}>Войти как кандидат</Button>
            <Button size="l" mode="secondary" before={<Icon20UserStarOutline />} onClick={() => { setRole('expert'); navigate('/expert'); }}>Войти как эксперт</Button>
          </div>
        </div>
      </Panel>

      <Panel title="Готовые прохождения" tone="pale">
        <Text className="pg-muted">Решения заполнены примером, открывается месяц спустя. Решение 2 подставлено — его можно изменить перед фиксацией.</Text>
        <div className="pg-presets">
          {PRESETS.map((p) => (
            <button key={p.id} type="button" className="pg-preset" onClick={() => { setState((s) => ({ tours: { ...s.tours, candidate: true } })); loadPreset(p.id); navigate('/play'); }}>
              <Text weight="2">{p.title}</Text>
              <Caption level="1" className="pg-muted">{p.text}</Caption>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}
