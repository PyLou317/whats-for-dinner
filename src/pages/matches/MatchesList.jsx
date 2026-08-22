import { CheckCircle2, Heart, Clock, Undo2 } from 'lucide-react';

export default function MatchesList({ matches, onSelectMatch, onUndoMatch }) {
  const handleUndo = (e, item, idx) => {
    e.stopPropagation();
    if (!onUndoMatch) return;
    onUndoMatch(item.id ?? idx, item); // id first, item second
  };

  return (
    <div className="space-y-3">
      {matches.map((item, idx) => (
        <div
          key={item.id || idx}
          className="glass-panel-interactive p-4 rounded-3xl flex items-center gap-4 relative overflow-hidden group cursor-pointer"
          onClick={() => onSelectMatch(item)}
        >
          <button
            type="button"
            onClick={(e) => handleUndo(e, item, idx)}
            className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900/70 text-slate-200 border border-slate-700 hover:bg-slate-800 transition text-[11px] font-semibold"
            aria-label={`Undo match for ${item.title}`}
            title="Undo match"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Undo
          </button>

          <div className="relative w-20 h-20 shrink-0">
            <img
              src={
                item.image_url ||
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
              }
              alt={item.title}
              className="w-full h-full object-cover rounded-2xl"
            />
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-md">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-bold border border-rose-500/20">
              <Heart className="w-3 h-3 fill-rose-500" />
              Mutual Match
            </div>
            <h3 className="font-bold text-white text-base truncate">
              {item.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="text-amber-400 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {item.prep_time || '25 mins'}
              </span>
              <span className="text-slate-400">Ready to cook</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
