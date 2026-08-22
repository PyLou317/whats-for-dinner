import React, { useEffect, useState } from 'react';

export default function OnboardingWelcomeModal({ open, onContinue }) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (open) setStep(1);
  }, [open]);

  if (!open) return null;

  const isIntroStep = step === 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-7 text-slate-100 shadow-2xl text-center">
        {isIntroStep ? (
          <>
            <p className="text-3xl">👋</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Welcome to What&apos;s for Dinner
            </h1>

            <p className="mt-4 text-lg leading-8 text-slate-200">
              We&apos;re excited to help you and your partner pick meals faster.
            </p>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="mt-7 inline-flex w-full animate-pulse items-center justify-center rounded-xl bg-rose-500 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              Next
            </button>
          </>
        ) : (
          <>
            <p className="text-3xl">🍽️</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Let&apos;s set up your starter recipes
            </h2>

            <p className="mt-4 text-lg leading-8 text-slate-200">
              We&apos;ve set you up with a few sample recipes to get started.
            </p>
            <p className="mt-2 text-lg leading-8 text-slate-200">
              Swipe <span className="font-semibold text-emerald-300">yes</span>{' '}
              to keep a recipe, or pass to remove it.
            </p>

            <button
              type="button"
              onClick={onContinue}
              className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-rose-500 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              Start swiping
            </button>
          </>
        )}
      </div>
    </div>
  );
}
