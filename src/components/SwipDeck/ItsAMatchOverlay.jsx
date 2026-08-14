export default function ItsAMatchOverlay({
  matchedRecipe,
  setMatchedRecipe,
  setSelectedRecipeDetail,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl"
    >
      <div className="w-full max-w-sm glass-panel p-6 rounded-3xl border-2 border-rose-500/50 shadow-2xl text-center space-y-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400" />

        <div className="space-y-1">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 mb-2 animate-bounce">
            <Sparkles className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight gradient-text-rose">
            It's a Match! 🎉
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            Both you and your partner swiped YES on tonight's meal!
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-inner space-y-3 p-3">
          <img
            src={
              matchedRecipe.image_url ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
            }
            alt={matchedRecipe.title}
            className="w-full h-44 object-cover rounded-xl"
          />
          <div className="text-left space-y-1">
            <h3 className="font-bold text-white text-lg">
              {matchedRecipe.title}
            </h3>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                {matchedRecipe.prep_time || "25 mins"}
              </span>
              <span className="text-emerald-400 font-semibold">
                Ready to Cook
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              const recipe = matchedRecipe;
              setMatchedRecipe(null);
              setSelectedRecipeDetail(recipe);
            }}
            className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 active-press transition-all"
          >
            <Utensils className="w-4 h-4" />
            View Cooking Directions
          </button>

          <button
            onClick={() => setMatchedRecipe(null)}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all"
          >
            Keep Swiping
          </button>
        </div>
      </div>
    </motion.div>
  );
}
