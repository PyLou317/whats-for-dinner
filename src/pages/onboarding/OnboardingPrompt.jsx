import React from 'react';

const OnboardingPrompt = ({ current = 0, total = 0 }) => {
  return (
    <div className="text-center">
      <h1 className="m-0 text-2xl font-semibold">Let’s set up your tastes</h1>
      <p className="mt-2 text-sm text-gray-500">Swipe right for yes, left for no</p>
      {total > 0 && (
        <p className="mt-2 text-xs text-gray-400">
          {Math.min(current + 1, total)} / {total}
        </p>
      )}
    </div>
  );
};

export default OnboardingPrompt;