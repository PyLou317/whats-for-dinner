import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  Calendar, 
  ChefHat, 
  Heart, 
  CheckCircle2, 
  Utensils, 
  X,
  BookOpen
} from 'lucide-react';

export default function MatchHistory({ matches = [], onSelectRecipe }) {
  const [selectedMatch, setSelectedMatch] = useState(null);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full space-y-4 min-h-[82vh] pb-32">
      {/* Header Banner */}
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
        <h2 className="text-xl font-bold text-white tracking-tight">Tonight's Dinner Winners 🍽️</h2>
        <p className="text-xs text-slate-400">
          Recipes that both you and your partner swiped YES on for today's meal selection.
        </p>
      </div>

      {/* Matches List */}
      {matches.length > 0 ? (
        <div className="space-y-3">
          {matches.map((item, idx) => (
            <div
              key={item.id || idx}
              className="glass-panel-interactive p-4 rounded-3xl flex items-center gap-4 relative overflow-hidden group cursor-pointer"
              onClick={() => setSelectedMatch(item)}
            >
              <div className="relative w-20 h-20 shrink-0">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
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
                <h3 className="font-bold text-white text-base truncate">{item.title}</h3>
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
      ) : (
        /* Empty State */
        <div className="glass-panel p-8 rounded-3xl text-center space-y-4 my-auto">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <Utensils className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Matches Yet Today</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Keep swiping on recipes together! As soon as both of you swipe YES on a recipe, it will instantly show up here.
            </p>
          </div>
        </div>
      )}

      {/* Match Detail Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl space-y-4 max-h-[85vh] overflow-y-auto relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Matched Recipe
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedMatch.title}</h3>
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
                {selectedMatch.instructions || 'Enjoy preparing this meal together!'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
