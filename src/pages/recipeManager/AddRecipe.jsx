import { Check, PlusCircle, Plus } from "lucide-react";

export default function AddRecipe({
  title,
  setTitle,
  prepTime,
  setPrepTime,
  tagsInput,
  setTagsInput,
  imageUrl,
  setImageUrl,
  instructions,
  setInstructions,
  handleAddCustomRecipe,
  submitting,
  formMsg,
}) {
  return (
    <div className="glass-panel p-5 rounded-3xl space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <PlusCircle className="w-5 h-5 text-rose-400" />
        <h3 className="font-bold text-white text-base">Add New Recipe</h3>
      </div>

      {formMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          {formMsg}
        </div>
      )}

      <form onSubmit={handleAddCustomRecipe} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Recipe Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Creamy Lemon Herb Salmon"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Prep Time
            </label>
            <input
              type="text"
              placeholder="e.g. 25 mins"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Quick, Seafood"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Image URL (Optional)
          </label>
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Instructions & Ingredients
          </label>
          <textarea
            rows={4}
            placeholder="1. Season ingredients...&#10;2. Cook over medium heat...&#10;3. Serve fresh."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 active-press transition-all disabled:opacity-50"
        >
          {submitting ? (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Save to Household Cookbook
            </>
          )}
        </button>
      </form>
    </div>
  );
}
