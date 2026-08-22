import { BookOpen, PlusCircle, Compass } from "lucide-react";

export default function TopSubNav({ activeSubTab, setActiveSubTab, recipes }) {
  return (
    <div className="flex rounded-2xl glass-panel p-1 border border-slate-800">
      <button
        onClick={() => setActiveSubTab("cookbook")}
        className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
          activeSubTab === "cookbook"
            ? "bg-rose-500 text-white shadow-md shadow-rose-500/25"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <BookOpen className="w-3.5 h-3.5" />
        Cookbook ({recipes.length})
      </button>
      <button
        onClick={() => setActiveSubTab("add")}
        className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
          activeSubTab === "add"
            ? "bg-rose-500 text-white shadow-md shadow-rose-500/25"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <PlusCircle className="w-3.5 h-3.5" />
        Add Custom
      </button>
      <button
        onClick={() => setActiveSubTab("discover")}
        className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
          activeSubTab === "discover"
            ? "bg-rose-500 text-white shadow-md shadow-rose-500/25"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <Compass className="w-3.5 h-3.5 text-amber-400" />
        Discover API
      </button>
    </div>
  );
}
