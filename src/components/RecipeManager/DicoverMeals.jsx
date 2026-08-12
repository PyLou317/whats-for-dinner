import { Search, Clock, Plus, Check } from "lucide-react";

export default function DiscoverMeals({
  discoverQuery,
  setDiscoverQuery,
  discoverLoading,
  discoverResults,
  handleSearchDiscover,
  handleCloneToCookbook,
  clonedIds,
  recipes,
}) {
  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchDiscover} className="flex gap-2">
        <input
          type="text"
          placeholder="Search online meals e.g. pasta, curry, steak..."
          value={discoverQuery}
          onChange={(e) => setDiscoverQuery(e.target.value)}
          className="flex-1 px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-2xl text-xs flex items-center gap-1.5 shrink-0 transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          Search
        </button>
      </form>

      {discoverLoading ? (
        <div className="text-center py-10 space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-amber-400 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-400">
            Fetching delicious meal ideas...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {discoverResults.map((item) => {
            const isCloned =
              clonedIds.has(item.id) ||
              recipes.some((r) => r.title === item.title);

            return (
              <div
                key={item.id}
                className="glass-panel-interactive p-3 rounded-2xl flex items-center gap-3"
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-bold text-white text-xs truncate">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                    <Clock className="w-3 h-3" />
                    {item.prep_time}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.tags?.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] text-slate-400"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleCloneToCookbook(item)}
                  disabled={isCloned}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1 transition-all ${
                    isCloned
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20"
                  }`}
                >
                  {isCloned ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      In Cookbook
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Add to Cookbook
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
