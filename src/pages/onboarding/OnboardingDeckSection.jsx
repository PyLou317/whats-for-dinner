import React from 'react';
import { AnimatePresence } from 'framer-motion';
import CardItem from '../swipeDeck/CardItem';
import LoadingState from '../../Utils/LoadingState';
import OnboardingCompleteState from './OnboardingCompleteState';

export default function OnboardingDeckSection({
  loading,
  availableCards,
  partnerSwipes,
  handleSwipe,
  swipeTopCardRef,
  keptCount,
  onNavigateToCookbook,
  onNavigateToRecipeFinder,
}) {
  return (
    <section className="flex-1 flex items-center justify-center min-h-0">
      {loading ? (
        <LoadingState text="Loading starter recipes..." />
      ) : availableCards.length > 0 ? (
        <div className="relative w-full max-w-md h-[460px] flex items-center justify-center">
          <AnimatePresence>
            {availableCards.slice(0, 3).map((recipe, index) => (
              <CardItem
                key={recipe.id}
                recipe={recipe}
                isTop={index === 0}
                index={index}
                totalCount={availableCards.length}
                partnerDecision={partnerSwipes[recipe.id]}
                onSwipe={handleSwipe}
                onSelectDetail={() => {}}
                registerSwipeTrigger={(fn) => {
                  if (index === 0) swipeTopCardRef.current = fn;
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <OnboardingCompleteState
            keptCount={keptCount}
            onNavigateToCookbook={onNavigateToCookbook}
            onNavigateToRecipeFinder={
              onNavigateToRecipeFinder || onNavigateToCookbook
            }
          />
        </div>
      )}
    </section>
  );
}
