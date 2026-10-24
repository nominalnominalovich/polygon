import { Shell } from './components/Shell';
import { TraceProvider } from './components/Trace';
import { useRoute } from './router';
import { useStore } from './store';
import { Landing } from './screens/Landing';
import { Program } from './screens/Program';
import { Play } from './screens/Play';
import { Expert } from './screens/Expert';
import { Defense } from './screens/Defense';
import { Jury } from './screens/Jury';
import { Author } from './screens/Author';
import { Dev } from './screens/Dev';
import { Glossary } from './screens/Glossary';

export function App() {
  const route = useRoute();
  const { role } = useStore();


  let screen;
  if (route.startsWith('/jury')) screen = <Jury />;
  else if (route.startsWith('/author')) screen = <Author />;
  else if (route === '/dev') screen = <Dev />;
  else if (route.startsWith('/defense')) screen = <Defense section={route.split('/')[2]} />;
  else if (route === '/glossary') screen = <Glossary />;
  else if (route === '/program' && role === 'candidate') screen = <Program />;
  else if (route === '/play' && role === 'candidate') screen = <Play />;
  else if (route.startsWith('/expert') && role === 'expert') screen = <Expert workId={route.split('/')[2]} />;
  else screen = <Landing />;

  return (
    <TraceProvider>
      <Shell>{screen}</Shell>
    </TraceProvider>
  );
}
