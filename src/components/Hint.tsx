/** Значок «i» с подсказкой по наведению или фокусу. */
export function Hint({ text }: { text: string }) {
  return (
    <span className="pg-hint" tabIndex={0} role="note" aria-label={text} data-tip={text}>
      i
    </span>
  );
}
