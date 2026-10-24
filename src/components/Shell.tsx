import { useRef, useState, type ReactNode } from 'react';
import { Button, Switch, Text } from '@vkontakte/vkui';
import { Icon20ArrowLeftOutline, Icon20DoorArrowRightOutline, Icon20QuestionOutline, Icon20ViewOutline } from '@vkontakte/icons';
import { navigate, useRoute } from '../router';
import { setState, useStore } from '../store';
import { Tour } from './Tour';

export function homeOf(role: 'candidate' | 'expert' | null) {
  return role === 'candidate' ? '/program' : role === 'expert' ? '/expert' : '/';
}

/** Назад с отчёта, редактора и презентации: в режиме жюри на страницу жюри, иначе домой по роли. */
export function BackToProduct({ className, size = 'm' }: { className?: string; size?: 's' | 'm' }) {
  const { role, jury } = useStore();
  return (
    <Button className={className} mode="secondary" size={size} before={<Icon20ArrowLeftOutline />} onClick={() => navigate(jury ? '/jury' : homeOf(role))}>
      Вернуться в продукт
    </Button>
  );
}

export function Logo() {
  const { role } = useStore();
  const clicks = useRef<number[]>([]);
  // Пять кликов за 3 секунды открывают скрытую панель разработчика.
  const onClick = () => {
    const now = Date.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 3000), now];
    if (clicks.current.length < 5) return navigate(homeOf(role));
    clicks.current = [];
    navigate('/dev');
  };
  return (
    <button className="pg-logo" onClick={onClick} aria-label="Полигон — на главную">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <rect width="28" height="28" rx="8" fill="#0077ff" />
        <path d="M7 19.5 11.5 10l4 6 2.5-3.5 3 7" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="pg-logo__text">Полигон</span>
    </button>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const route = useRoute();
  const { role, trace, jury, tours } = useStore();
  const [tour, setTour] = useState(false);
  const onDefense = route.startsWith('/defense') || route.startsWith('/jury');
  const autoTour = role && !onDefense && !tours[role] && (route === '/program' || route.startsWith('/expert'));
  return (
    <div className="pg-app">
      <header className="pg-header">
        <div className="pg-header__inner">
          <Logo />
          {role && !onDefense && (
            <nav className="pg-header__nav">
              <button type="button" className={route === '/program' || route === '/play' || route === '/expert' ? 'is-current' : ''} onClick={() => navigate(homeOf(role))}>
                {role === 'candidate' ? 'Моя программа' : 'Работы кандидатов'}
              </button>
              <Text className="pg-header__role">{role === 'candidate' ? 'Кандидат · карьерная школа банка «Кварц»' : 'Продуктовый эксперт · банк «Кварц»'}</Text>
            </nav>
          )}
          <div className="pg-header__right">
            {jury && !onDefense && (
              <label className="pg-trace-toggle" title="Показать, какие истории и фичи реализует каждый блок">
                <Icon20ViewOutline />
                <span>Режим обоснования</span>
                <Switch checked={trace} onChange={(e) => setState({ trace: e.currentTarget.checked })} aria-label="Режим обоснования" />
              </label>
            )}
            {role && !onDefense && (
              <Button mode="tertiary" size="m" before={<Icon20QuestionOutline />} onClick={() => setTour(true)} aria-label="Как это устроено">
                <span className="pg-hide-s">Как это устроено</span>
              </Button>
            )}
            {role && !onDefense && (
              <Button mode="tertiary" size="m" before={<Icon20DoorArrowRightOutline />} onClick={() => { setState({ role: null }); navigate('/'); }}>
                Выйти
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="pg-main">{children}</main>
      <footer className="pg-footer">
        <Text className="pg-muted">
          Учебный проект ВШЭ, курс «Принципы и подходы к разработке цифровых продуктов», 2026. Банк «Кварц», люди и данные вымышлены.
        </Text>
        <button type="button" className="pg-footer__jury" onClick={() => { setState({ jury: true }); navigate('/jury'); }}>Для жюри</button>
      </footer>
      {role && (tour || autoTour) && <Tour role={role} onClose={() => setTour(false)} />}
    </div>
  );
}
