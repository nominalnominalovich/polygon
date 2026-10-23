import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AdaptivityProvider, AppRoot, ConfigProvider } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import './styles.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider colorScheme="light">
      <AdaptivityProvider>
        <AppRoot mode="full">
          <App />
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  </StrictMode>,
);
