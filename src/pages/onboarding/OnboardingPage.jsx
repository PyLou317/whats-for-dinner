import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SwipeDeck from '../swipeDeck/SwipeDeck.jsx';
import OnboardingWelcomeModal from './OnboardingWelcomeModal.jsx';

export default function OnboardingPage({
  user,
  profile,
  recipes,
  onAddMatch,
  onMatchesLoaded,
}) {
  const [showWelcome, setShowWelcome] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <OnboardingWelcomeModal
        open={showWelcome}
        onContinue={() => setShowWelcome(false)}
      />

      {!showWelcome && (
        <SwipeDeck
          user={user}
          profile={profile}
          recipes={recipes}
          onAddMatch={onAddMatch}
          onMatchesLoaded={onMatchesLoaded}
          onboardingOnly
          onNavigateToCookbook={() => navigate('/cookbook')}
          onNavigateToRecipeFinder={() => navigate('/cookbook')}
        />
      )}
    </div>
  );
}
