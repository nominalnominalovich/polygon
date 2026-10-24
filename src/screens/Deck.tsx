import { BackToProduct } from '../components/Shell';

export function Deck() {
  return (
    <div className="pg-deck">
      <iframe src={`${import.meta.env.BASE_URL}deck/index.html`} title="Презентация проекта «Полигон»" allowFullScreen />
      <BackToProduct className="pg-deck__back" size="s" />
    </div>
  );
}
