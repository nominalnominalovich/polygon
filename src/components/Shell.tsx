import type { ReactNode } from 'react';
import { Button, Switch, Text } from '@vkontakte/vkui';
import { Icon20DocumentOutline, Icon20DoorArrowRightOutline, Icon20ViewOutline } from '@vkontakte/icons';
import { navigate, useRoute } from '../router';
import { setState, useStore } from '../store';

export function Logo() {
  return (
    <button className="pg-logo" onClick={() => navigate('/')} aria-label="Полигон — на главную">
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
  const { role, trace } = useStore();
  const onDefense = route.startsWith('/defense');
  return (
    <div className="pg-app">
      <header className="pg-header">
        <div className="pg-header__inner">
          <Logo />
          {role && !onDefense && (
            <Text className="pg-header__role">{role === 'candidate' ? 'Кандидат · Карьерная школа банка «Кварц»' : 'Продуктовый эксперт · банк «Кварц»'}</Text>
          )}
          <div className="pg-header__right">
            {!onDefense && (
              <label className="pg-trace-toggle" title="Показать, какие истории и фичи реализует каждый блок">
                <Icon20ViewOutline />
                <span>Режим обоснования</span>
                <Switch checked={trace} onChange={(e) => setState({ trace: e.currentTarget.checked })} aria-label="Режим обоснования" />
              </label>
            )}
            <Button mode={onDefense ? 'secondary' : 'primary'} size="m" before={<Icon20DocumentOutline />} onClick={() => navigate(onDefense ? (role ? (role === 'expert' ? '/expert' : '/play') : '/') : '/defense')}>
              {onDefense ? 'Вернуться в продукт' : 'Материалы защиты'}
            </Button>
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
        <Text className="pg-muted">Учебный проект ВШЭ, курс «Основы инженерии цифровых продуктов», 2026. Банк «Кварц», люди и данные вымышлены.</Text>
      </footer>
    </div>
  );
}
