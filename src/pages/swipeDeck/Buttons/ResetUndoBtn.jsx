import { Undo2 } from 'lucide-react';

export default function ResetUndoBtn({ onReset }) {
  return (
    <button
      type="button"
      onClick={onReset}
      className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-lg shadow-slate-900/30 flex items-center justify-center active-press transition-all hover:scale-105"
      title="Undo last swipe"
      aria-label="Undo last swipe"
    >
      <Undo2 className="w-7 h-7" />
    </button>
  );
}
