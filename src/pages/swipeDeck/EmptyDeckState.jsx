import { BookOpen, RotateCcw, Sparkles } from 'lucide-react';

export default function EmptyDeckState({
  onNavigateToCookbook,
  handleResetSwipes,
}) {
  return (
    <div className="glass-panel p-8 rounded-3xl text-center space-y-4 max-w-sm mx-auto">
      <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
        <Sparkles className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">
          All Swiped for Today! 🎉
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          You've reviewed all available recipes in your deck. Check your matches
          or reset to swipe again.
        </p>
      </div>
      <div className="pt-2 flex flex-col gap-2">
        <button
          onClick={onNavigateToCookbook}
          className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl text-xs shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <BookOpen className="w-4 h-4" />
          Add More Recipes in Cookbook
        </button>
        <button
          onClick={handleResetSwipes}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 flex items-center justify-center gap-2 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Today's Swipes
        </button>
      </div>
    </div>
  );
}
