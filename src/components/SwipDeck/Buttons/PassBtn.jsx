import { X } from "lucide-react";

export default function PassBtn({
  swipeTopCardRef,
  handleSwipe,
  currentTopCard,
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (swipeTopCardRef.current) {
          swipeTopCardRef.current("no", "left");
        } else if (currentTopCard) {
          handleSwipe(currentTopCard, "no", "left");
        }
      }}
      className="w-16 h-16 rounded-full bg-slate-900 hover:bg-rose-950/80 text-rose-400 border-2 border-rose-500/30 flex items-center justify-center shadow-lg shadow-rose-950/40 active-press transition-all hover:scale-105"
      title="Pass / No"
    >
      <X className="w-7 h-7 stroke-[3]" />
    </button>
  );
}
