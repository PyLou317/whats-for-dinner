import React from 'react';

export default function OnboardingCompleteState({
  keptCount = 0,
  onNavigateToCookbook,
  onNavigateToRecipeFinder,
}) {
  const recipeLabel = keptCount === 1 ? 'recipe' : 'recipes';

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-slate-900/90 px-6 py-8 text-center text-slate-100 shadow-2xl">
      <p className="text-3xl">🎉</p>

      <h2 className="mt-3 text-2xl font-semibold tracking-tight">
        You&apos;re all set
      </h2>

      <p className="mt-4 text-lg leading-8 text-slate-200">
        You added{' '}
        <span className="font-semibold text-emerald-300">
          {keptCount} new {recipeLabel}
        </span>{' '}
        to your cookbook.
      </p>

      <p className="mt-3 text-base leading-7 text-slate-300">
        Next, add some of your own recipes or search for more in Recipe Finder.
      </p>

      <div className="mt-7 flex flex-col gap-3">
        <button
          type="button"
          onClick={onNavigateToCookbook}
          className="inline-flex w-full items-center justify-center rounded-xl bg-rose-500 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
        >
          Add my own recipes
        </button>

        <button
          type="button"
          onClick={onNavigateToRecipeFinder}
          className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-base font-semibold text-slate-100 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          Open Recipe Finder
        </button>
      </div>
    </div>
  );
}
