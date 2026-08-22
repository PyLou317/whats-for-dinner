export default function RecipeDetailModal({
  selectedRecipeDetail,
  setSelectedRecipeDetail,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md glass-panel p-6 rounded-3xl space-y-4 max-h-[85vh] overflow-y-auto relative">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
              <ChefHat className="w-4 h-4" />
              Recipe Overview
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              {selectedRecipeDetail.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setSelectedRecipeDetail(null)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <img
          src={
            selectedRecipeDetail.image_url ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
          }
          alt={selectedRecipeDetail.title}
          className="w-full h-48 object-cover rounded-2xl"
        />

        <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <span className="flex items-center gap-1 text-amber-400 font-medium">
            <Clock className="w-4 h-4" />
            Prep: {selectedRecipeDetail.prep_time || "20 mins"}
          </span>
          <span className="text-slate-300">
            Tags: {selectedRecipeDetail.tags?.join(", ") || "General"}
          </span>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
            Instructions & Ingredients
          </h4>
          <div className="text-xs text-slate-300 whitespace-pre-line bg-slate-900 p-4 rounded-2xl border border-slate-800">
            {selectedRecipeDetail.instructions ||
              "No detailed instructions provided for this recipe."}
          </div>
        </div>
      </div>
    </div>
  );
}
