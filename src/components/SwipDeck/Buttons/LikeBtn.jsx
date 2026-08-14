import { Heart } from 'lucide-react';

export default function LikeBtn({
  swipeTopCardRef,
  currentTopCard,
  handleSwipe,
}) {
  const onLike = () => {
    if (typeof swipeTopCardRef?.current === 'function') {
      swipeTopCardRef.current('yes');
      return;
    }

    if (currentTopCard) {
      handleSwipe(currentTopCard, 'yes', 'right');
    }
  };

  return (
    <button
      type="button"
      onClick={onLike}
      className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-xl shadow-rose-500/30 flex items-center justify-center active-press transition-all hover:scale-105"
      aria-label="Like"
    >
      <Heart className="w-8 h-8 fill-white" />
    </button>
  );
}
