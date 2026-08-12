export default function DetailModal({ selectedRecipe, setSelectedRecipe }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md glass-panel p-6 rounded-3xl space-y-4 max-h-[85vh] overflow-y-auto relative">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold text-white">
            {selectedRecipe.title}
          </h3>
          <button
            onClick={() => setSelectedRecipe(null)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <img
          src={selectedRecipe.image_url}
          alt={selectedRecipe.title}
          className="w-full h-44 object-cover rounded-xl"
        />
        <div className="text-xs text-slate-300 whitespace-pre-line bg-slate-900 p-4 rounded-xl border border-slate-800">
          {selectedRecipe.instructions || "No detailed instructions."}
        </div>
      </div>
    </div>
  );
}
