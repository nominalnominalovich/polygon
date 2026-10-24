import { useEffect, useMemo } from 'react';
import { marked } from 'marked';
import { Button, Caption, Text } from '@vkontakte/vkui';
import { Icon20DownloadOutline, Icon20FullscreenOutline } from '@vkontakte/icons';
import source from '../content/defense.md?raw';
import { navigate } from '../router';
import { BackToProduct } from '../components/Shell';

type Section = { id: string; title: string; html: string };

function parse(md: string): { intro: string; sections: Section[] } {
  const parts = md.split(/^## /m);
  const intro = marked.parse(parts.shift() ?? '', { async: false });
  const sections = parts.map((p) => {
    const nl = p.indexOf('\n');
    const head = p.slice(0, nl);
    const m = head.match(/^(.*?)\s*\{#([\w-]+)\}\s*$/);
    const title = (m ? m[1] : head).trim();
    const id = m ? m[2] : title.toLowerCase().replace(/[^\wа-яё]+/gi, '-');
    return { id, title, html: marked.parse(p.slice(nl + 1), { async: false }) };
  });
  return { intro, sections };
}

const BASE = import.meta.env.BASE_URL;

export function Defense({ section }: { section?: string }) {
  const { intro, sections } = useMemo(() => parse(source), []);
  useEffect(() => {
    if (section) document.getElementById(section)?.scrollIntoView({ block: 'start' });
  }, [section]);

  return (
    <div className="pg-doc">
      <aside className="pg-doc__nav">
        <Caption level="1" className="pg-muted">Материалы защиты</Caption>
        <div><BackToProduct /></div>
        <nav>
          {sections.map((s) => (
            <a key={s.id} href={`#/defense/${s.id}`} className={section === s.id ? 'is-current' : ''}>{s.title}</a>
          ))}
        </nav>
      </aside>
      <article className="pg-doc__body">
        <div className="pg-doc__actions">
          <Button size="m" before={<Icon20FullscreenOutline />} onClick={() => navigate('/deck')}>Презентация</Button>
          <Button size="m" mode="secondary" before={<Icon20DownloadOutline />} href={`${BASE}files/report.pdf`} target="_blank">Отчёт PDF</Button>
          <Button size="m" mode="secondary" before={<Icon20DownloadOutline />} href={`${BASE}files/report.docx`}>Отчёт DOCX</Button>
          <Button size="m" mode="secondary" before={<Icon20DownloadOutline />} href={`${BASE}files/deck.pdf`} target="_blank">Презентация PDF</Button>
          <Button size="m" mode="tertiary" href={`${BASE}files/canvas.pdf`} target="_blank">Канва</Button>
          <a className="pg-doc__badge" href="https://github.com/nominalnominalovich/polygon/actions/workflows/deploy.yml" target="_blank" rel="noreferrer" title="Сборка и автотесты на GitHub Actions">
            <img src="https://github.com/nominalnominalovich/polygon/actions/workflows/deploy.yml/badge.svg" alt="Статус сборки и автотестов" height="20" />
          </a>
        </div>
        <div className="pg-md" dangerouslySetInnerHTML={{ __html: intro }} />
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="pg-md pg-doc__section">
            <h2>{s.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: s.html }} />
          </section>
        ))}
        <Text className="pg-muted">Банк «Кварц», люди и данные вымышлены. Наблюдения (Н) отмечены отдельно от гипотез (Г).</Text>
      </article>
    </div>
  );
}
