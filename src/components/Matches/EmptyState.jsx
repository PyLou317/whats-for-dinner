export default function EmptyState() {
  return (
    <div className="glass-panel p-8 rounded-3xl text-center space-y-4 my-auto">
      <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
        <Utensils className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white">No Matches Yet Today</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Keep swiping on recipes together! As soon as both of you swipe YES on
          a recipe, it will instantly show up here.
        </p>
      </div>
    </div>
  );
}
