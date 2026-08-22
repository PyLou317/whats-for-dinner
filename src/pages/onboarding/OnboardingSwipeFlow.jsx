import React from 'react';
import OnboardingPrompt from './OnboardingPrompt.jsx';

const OnboardingSwipeFlow = ({
  currentIndex = 0,
  total = 0,
  showPrompt = true,
  children,
}) => {
  return (
    <main
      role="main"
      aria-label="Onboarding swipes"
      className="min-h-dvh w-full px-4 py-6 flex flex-col gap-4 overflow-hidden"
    >
      {showPrompt && (
        <section className="flex justify-center items-center">
          <OnboardingPrompt current={currentIndex} total={total} />
        </section>
      )}

      {children}
    </main>
  );
};

export default OnboardingSwipeFlow;
