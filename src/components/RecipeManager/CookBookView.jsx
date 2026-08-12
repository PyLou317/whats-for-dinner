import {
  Trash2,
  Utensils,
  Search,
  Clock,
  ChefHat,
  Compass,
} from "lucide-react";

export default function CookBookView({
  searchQuery,
  setSearchQuery,
  filteredRecipes,
  setSelectedRecipe,
  handleDeleteRecipe,
  setActiveSubTab,
}) {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search recipes by title or tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/70 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
        />
      </div>

      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="glass-panel-interactive p-3.5 rounded-2xl flex items-center gap-3 relative group"
            >
              <img
                src={
                  recipe.image_url ||
                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
                }
                alt={recipe.title}
                className="w-20 h-20 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0 pr-6 space-y-1">
                <h4 className="font-bold text-white text-sm truncate">
                  {recipe.title}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {recipe.prep_time}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {recipe.tags?.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => setSelectedRecipe(recipe)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                  title="View Details"
                >
                  <Utensils className="w-4 h-4 text-rose-400" />
                </button>
                <button
                  onClick={() => handleDeleteRecipe(recipe.id)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-all"
                  title="Delete Recipe"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-3xl text-center space-y-3">
          <ChefHat className="w-12 h-12 text-slate-500 mx-auto" />
          <h4 className="font-bold text-white text-base">No Recipes Found</h4>
          <p className="text-xs text-slate-400">
            Add custom recipes or discover trending meals to populate your
            cookbook!
          </p>
          <button
            onClick={() => setActiveSubTab("discover")}
            className="mt-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl text-xs inline-flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            Discover Recipes
          </button>
        </div>
      )}
    </div>
  );
}
