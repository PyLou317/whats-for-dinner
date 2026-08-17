import { Sparkles } from 'lucide-react';

export default function HeaderBanner({ todayStr }) {
  return (
    <div className="glass-panel p-5 rounded-3xl space-y-2 border-rose-500/20 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
          <Sparkles className="w-4 h-4 text-amber-400" />
          MUTUAL MATCHES
        </div>
        <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
          {todayStr}
        </span>
      </div>
      <h2 className="text-xl font-bold text-white tracking-tight">
        Tonight's Dinner Winners 🍽️
      </h2>
      <p className="text-xs text-slate-400">
        Recipes that both you and your partner swiped YES on for today's meal
        selection.
      </p>
    </div>
  );
}
