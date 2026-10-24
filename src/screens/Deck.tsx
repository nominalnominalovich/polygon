import { Button } from '@vkontakte/vkui';
import { Icon20ArrowLeftOutline } from '@vkontakte/icons';
import { navigate } from '../router';

export function Deck() {
  return (
    <div className="pg-deck">
      <iframe src={`${import.meta.env.BASE_URL}deck/index.html`} title="Презентация проекта «Полигон»" allowFullScreen />
      <Button className="pg-deck__back" mode="secondary" size="s" before={<Icon20ArrowLeftOutline />} onClick={() => navigate('/jury')}>К материалам</Button>
    </div>
  );
}
