import { Button, Caption, DisplayTitle, Headline, Text } from '@vkontakte/vkui';
import { Icon20DocumentOutline, Icon20UserStarOutline, Icon24EducationOutline } from '@vkontakte/icons';
import { navigate } from '../router';
import { setState, useStore } from '../store';
import { Trace } from '../components/Trace';
import { Pill } from '../components/ui';

const enter = (role: 'candidate' | 'expert') => {
  setState({ role });
  navigate(role === 'candidate' ? '/program' : '/expert');
};

export function Landing() {
  const { jury } = useStore();
  return (
    <div className="pg-landing">
      <section className="pg-hero">
        <div className="pg-hero__text">
          <Pill tone="solid">Продуктовая школа-симулятор</Pill>
          <DisplayTitle level="1" className="pg-hero__title">Учиться продуктовым решениям на&nbsp;последствиях, а&nbsp;не&nbsp;на&nbsp;тестах</DisplayTitle>
          <Text className="pg-hero__lead">
            Кандидат ведёт сервис банка через несколько эпизодов. Его решения сохраняются, меняют метрики и сталкиваются с внешними событиями. Потом — разбор по критериям и самостоятельная задача, которую видит продуктовый эксперт банка.
          </Text>
          <Trace ids={['И1', 'Ф1']} note="Вход без регистрации: прогресс хранится только в этом браузере.">
            <div className="pg-hero__actions">
              <Button size="l" mode="primary" before={<Icon24EducationOutline />} onClick={() => enter('candidate')}>Войти как кандидат</Button>
              <Button size="l" mode="secondary" before={<Icon20UserStarOutline />} onClick={() => enter('expert')}>Войти как эксперт банка</Button>
            </div>
          </Trace>
          <Caption level="1" className="pg-muted">Демо-вход без регистрации. Прогресс хранится только в этом браузере.</Caption>
        </div>
        <div className="pg-hero__preview" aria-hidden="true">
          <div className="pg-preview">
            <div className="pg-preview__bar"><span /><span /><span /></div>
            <Caption level="1" className="pg-muted">Эпизод 1 · месяц спустя</Caption>
            <Headline level="1" weight="2">Автопополнение: 18% → 15,1%</Headline>
            <div className="pg-msg pg-msg--warn"><div className="pg-msg__avatar">И</div><div><Text weight="2">Ирина <span className="pg-muted">· руководитель</span></Text><Text>Автопополнение упало! Что сломалось? Давай срочно баллы.</Text></div></div>
            <div className="pg-msg"><div className="pg-msg__avatar">Я</div><div><Text weight="2">Вы <span className="pg-muted">· младший продакт</span></Text><Text>…</Text></div></div>
            <Caption level="1" className="pg-muted">Что вы ответите руководителю?</Caption>
          </div>
        </div>
      </section>

      <section className="pg-how">
        {[
          ['01', 'Досье и решение', 'Воронка, обращения, опрос, стейкхолдеры. Выбираете проблему, сегмент и инициативы в пределах ёмкости команды.'],
          ['02', 'Последствия и пересмотр', 'Месяц спустя: ваш релиз и внешнее событие. Отделяете одно от другого и пересматриваете план, не стирая первую версию.'],
          ['03', 'Разбор по критериям', 'Шесть критериев с фрагментами вашей работы. Правила модели открыты — никакого «казино».'],
          ['04', 'Перенос и карточка', 'Новая задача без подсказок. Работу видит эксперт банка — только если вы сами её передали.'],
        ].map(([n, t, d]) => (
          <div key={n} className="pg-how__item">
            <span className="pg-how__num">{n}</span>
            <Headline level="1" weight="2">{t}</Headline>
            <Text className="pg-muted">{d}</Text>
          </div>
        ))}
      </section>

      {jury && (
      <section className="pg-defense-cta">
          <div>
            <Headline level="1" weight="2">Материалы для жюри</Headline>
            <Text className="pg-muted">Отчёт, презентация, команда и готовые прохождения — в одном месте.</Text>
          </div>
          <Button size="l" mode="outline" before={<Icon20DocumentOutline />} onClick={() => navigate('/jury')}>Открыть материалы для жюри</Button>
        </section>
      )}
    </div>
  );
}
