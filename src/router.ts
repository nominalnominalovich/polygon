import { useSyncExternalStore } from 'react';

const subscribe = (l: () => void) => {
  window.addEventListener('hashchange', l);
  return () => window.removeEventListener('hashchange', l);
};

/** Маршрут без решётки: '/', '/play', '/defense/strategy' … */
export function useRoute(): string {
  return useSyncExternalStore(subscribe, () => window.location.hash.replace(/^#/, '') || '/');
}

export function navigate(path: string) {
  window.location.hash = path;
  window.scrollTo({ top: 0 });
}
