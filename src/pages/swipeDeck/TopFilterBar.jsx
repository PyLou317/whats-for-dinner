import { ChefHat } from "lucide-react";

export default function TopFilterBar({ tagFilter, setTagFilter, allTags }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none z-10 mb-2">
      {allTags.map((tag) => (
        <button
          key={tag}
          onClick={() => setTagFilter(tag)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
            tagFilter === tag
              ? "bg-rose-500 text-white shadow-sm shadow-rose-500/30"
              : "glass-panel text-slate-300 hover:bg-slate-800"
          }`}
        >
          {tag === "All" && <ChefHat className="w-3.5 h-3.5" />}
          {tag}
        </button>
      ))}
    </div>
  );
}
