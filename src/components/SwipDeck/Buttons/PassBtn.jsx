import { X } from 'lucide-react';

export default function PassBtn({
  swipeTopCardRef,
  currentTopCard,
  handleSwipe,
}) {
  const onPass = () => {
    if (typeof swipeTopCardRef?.current === 'function') {
      swipeTopCardRef.current('no');
      return;
    }

    if (currentTopCard) {
      handleSwipe(currentTopCard, 'no', 'left');
    }
  };

  return (
    <button
      type="button"
      onClick={onPass}
      aria-label="Pass"
      className="w-16 h-16 rounded-full bg-slate-800 hover:bg-rose-950/80 text-rose-400 border-2 border-rose-500/30 flex items-center justify-center shadow-lg shadow-rose-950/40 active-press transition-all hover:scale-105"
    >
      <X className="w-8 h-8 stroke-3" />
    </button>
  );
}
