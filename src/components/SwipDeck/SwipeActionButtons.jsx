import React from "react";

export default function SwipeActionButtons({
  onNo,
  onYes,
  disabled = false,
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* NO */}
      <div className="relative group">
        <button
          type="button"
          onClick={onNo}
          disabled={disabled}
          title="No — pass on this recipe"
          aria-label="No, pass on this recipe"
          className="h-14 w-14 rounded-full bg-slate-800 text-white border border-white/10 flex items-center justify-center hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ✕
        </button>
        <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-slate-100 opacity-0 shadow-md ring-1 ring-white/10 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          No — Pass
        </span>
      </div>

      {/* YES */}
      <div className="relative group">
        <button
          type="button"
          onClick={onYes}
          disabled={disabled}
          title="Yes — keep this recipe"
          aria-label="Yes, keep this recipe"
          className="h-14 w-14 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ♥
        </button>
        <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-slate-100 opacity-0 shadow-md ring-1 ring-white/10 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          Yes — Keep
        </span>
      </div>
    </div>
  );
}