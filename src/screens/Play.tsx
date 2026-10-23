import { Button, Caption } from '@vkontakte/vkui';
import { Icon20RefreshOutline } from '@vkontakte/icons';
import { STEPS, goStep, resetRun, useStore } from '../store';
import { Dossier } from './steps/Dossier';
import { Decision1 } from './steps/Decision1';
import { Outcome1 } from './steps/Outcome1';
import { Decision2 } from './steps/Decision2';
import { Debrief } from './steps/Debrief';
import { Transfer } from './steps/Transfer';
import { Card } from './steps/Card';

export function Play() {
  const s = useStore();
  const reachedIdx = STEPS.findIndex((x) => x.id === s.reached);
  return (
    <div className="pg-page pg-page--wide">
      <nav className="pg-stepper" aria-label="Шаги модуля">
        {STEPS.map((x, i) => (
          <button
            key={x.id}
            className={`pg-stepper__item ${x.id === s.step ? 'is-current' : ''} ${i <= reachedIdx ? 'is-reached' : ''}`}
            disabled={i > reachedIdx}
            onClick={() => goStep(x.id)}
          >
            <span className="pg-stepper__num">{i + 1}</span>
            <span className="pg-stepper__label">{x.label}</span>
            <Caption level="2" className="pg-stepper__screen">{x.screen}</Caption>
          </button>
        ))}
        <Button mode="tertiary" size="s" before={<Icon20RefreshOutline />} onClick={() => { if (confirm('Начать модуль заново? Ваши решения будут удалены.')) resetRun(); }}>
          Заново
        </Button>
      </nav>
      {s.step === 'dossier' && <Dossier />}
      {s.step === 'decision1' && <Decision1 />}
      {s.step === 'outcome1' && <Outcome1 />}
      {s.step === 'decision2' && <Decision2 />}
      {s.step === 'debrief' && <Debrief />}
      {s.step === 'transfer' && <Transfer />}
      {s.step === 'card' && <Card />}
    </div>
  );
}
