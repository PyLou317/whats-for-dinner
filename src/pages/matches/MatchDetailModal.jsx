import { CheckCircle2, X } from 'lucide-react';

export default function MatchDetailModal({ selectedMatch, setSelectedMatch }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md glass-panel p-6 rounded-3xl space-y-4 max-h-[85vh] overflow-y-auto relative">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Matched Recipe
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              {selectedMatch.title}
            </h3>
          </div>
          <button
            onClick={() => setSelectedMatch(null)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <img
          src={selectedMatch.image_url}
          alt={selectedMatch.title}
          className="w-full h-48 object-cover rounded-2xl"
        />

        <div className="space-y-2">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
            Instructions & Ingredients
          </h4>
          <div className="text-xs text-slate-300 whitespace-pre-line bg-slate-900 p-4 rounded-2xl border border-slate-800">
            {selectedMatch.instructions ||
              'Enjoy preparing this meal together!'}
          </div>
        </div>
      </div>
    </div>
  );
}
