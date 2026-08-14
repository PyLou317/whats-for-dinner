export default function LoadingState({ text }) {
  return (
    <div className="text-center space-y-3">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-rose-500 border-t-transparent mx-auto" />
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}
