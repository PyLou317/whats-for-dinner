import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { supabase, isConfigured } from '../../lib/supabaseClient';
import fetchTodaySwipesAndRecipes from '../../API/fetchTodaySwipesAndRecipes';

import RecipeDetailModal from './RecipeDetailModal';
import ItsAMatchOverlay from './ItsAMatchOverlay';
import ResetUndoBtn from './Buttons/ResetUndoBtn';
import LikeBtn from './Buttons/LikeBtn';
import PassBtn from './Buttons/PassBtn';
import EmptyDeckState from './EmptyDeckState';
import CardItem from './CardItem';
import TopFilterBar from './TopFilterBar';
import LoadingState from '../../Utils/LoadingState';

import getLocalDateStr from '../../Utils/getLocalDateStr';

export default function SwipeDeck({
  user,
  profile,
  recipes = [],
  onAddMatch,
  onNavigateToCookbook,
}) {
  const [deck, setDeck] = useState([]);
  const [swipedRecipeIds, setSwipedRecipeIds] = useState(new Set());
  const [userSwipes, setUserSwipes] = useState({}); // recipeId -> 'yes'|'no'
  const [partnerSwipes, setPartnerSwipes] = useState({}); // recipeId -> 'yes'|'no'
  const [matchedRecipe, setMatchedRecipe] = useState(null);
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);
  const [tagFilter, setTagFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const swipeTopCardRef = useRef(null);
  const lastSwipedRef = useRef(null);

  const userSwipesRef = useRef(userSwipes);
  useEffect(() => {
    userSwipesRef.current = userSwipes;
  }, [userSwipes]);

  const deckRef = useRef(deck);
  useEffect(() => {
    deckRef.current = deck;
  }, [deck]);

  const [todayStr, setTodayStr] = useState(getLocalDateStr());

  // 1. Auto-reset at midnight local time
  useEffect(() => {
    const checkDateChange = () => {
      const currentLocal = getLocalDateStr();
      if (currentLocal !== todayStr) {
        setTodayStr(currentLocal);
      }
    };

    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      0,
    );
    const msUntilMidnight = midnight.getTime() - now.getTime();

    const timer = setTimeout(() => {
      checkDateChange();
    }, msUntilMidnight);

    const interval = setInterval(checkDateChange, 60000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [todayStr]);

  // 2. Load initial recipes & existing swipes for today
  useEffect(() => {
    fetchTodaySwipesAndRecipes({
      setDeck,
      setSwipedRecipeIds,
      setUserSwipes,
      setPartnerSwipes,
      setLoading,
      user,
      profile,
      recipes,
      todayStr,
      isConfigured,
    });
  }, [recipes, profile?.household_id, todayStr]);

  // 3. Set up Supabase Realtime Subscription for swipes in current household
  useEffect(() => {
    if (!isConfigured || !profile?.household_id) return;

    const channel = supabase
      .channel(`realtime-swipes-${profile.household_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'swipes',
          filter: `household_id=eq.${profile.household_id}`,
        },
        (payload) => {
          const newSwipe = payload.new;
          if (newSwipe && newSwipe.swipe_date === todayStr) {
            if (newSwipe.user_id !== user?.id) {
              setPartnerSwipes((prev) => ({
                ...prev,
                [newSwipe.recipe_id]: newSwipe.decision,
              }));

              if (
                newSwipe.decision === 'yes' &&
                userSwipesRef.current[newSwipe.recipe_id] === 'yes'
              ) {
                const match = deckRef.current.find(
                  (r) => r.id === newSwipe.recipe_id,
                );
                if (match) triggerMatchOverlay(match);
              }
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.household_id, user?.id, todayStr]);

  const availableCards = deck.filter((recipe) => {
    if (swipedRecipeIds.has(recipe.id)) return false;
    if (tagFilter !== 'All' && !recipe.tags?.includes(tagFilter)) return false;
    return true;
  });

  const currentTopCard = availableCards[0];

  // Robust Swipe Handler
  const handleSwipe = (recipe, decision, direction = 'right') => {
    if (!recipe) return;
    const recipeId = recipe.id;

    lastSwipedRef.current = { recipeId, decision, direction };

    setSwipedRecipeIds((prev) => {
      const next = new Set(prev);
      next.add(recipeId);

      try {
        const storageKey = `whats_for_dinner_swipes_${user?.id || 'demo'}_${todayStr}`;
        localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      } catch (e) {}

      return next;
    });

    setUserSwipes((prev) => ({ ...prev, [recipeId]: decision }));

    if (isConfigured && profile?.household_id && user?.id) {
      supabase
        .from('swipes')
        .upsert(
          {
            household_id: profile.household_id,
            recipe_id: recipeId,
            user_id: user.id,
            decision,
            swipe_date: todayStr,
          },
          { onConflict: 'user_id,recipe_id,swipe_date' },
        )
        .then(({ error }) => {
          if (error) console.error('Supabase swipe error:', error);
        })
        .catch((err) => console.error('Failed to record swipe:', err));
    }

    if (decision === 'yes' && partnerSwipes[recipeId] === 'yes') {
      triggerMatchOverlay(recipe);
    }
  };

  const triggerMatchOverlay = (recipe) => {
    setMatchedRecipe(recipe);
    if (onAddMatch) onAddMatch(recipe);

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fbbf24', '#34d399', '#60a5fa'],
      });
    } catch (e) {
      console.log('Confetti error:', e);
    }
  };

  const handleResetSwipes = async () => {
    const lastSwipe = lastSwipedRef.current;
    if (!lastSwipe) return;

    const { recipeId } = lastSwipe;

    setSwipedRecipeIds((prev) => {
      const next = new Set(prev);
      next.delete(recipeId);

      try {
        const storageKey = `whats_for_dinner_swipes_${user?.id || 'demo'}_${todayStr}`;
        localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      } catch (e) {}

      return next;
    });

    setUserSwipes((prev) => {
      const next = { ...prev };
      delete next[recipeId];
      return next;
    });

    if (isConfigured && profile?.household_id && user?.id) {
      try {
        await supabase
          .from('swipes')
          .delete()
          .eq('household_id', profile.household_id)
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId)
          .eq('swipe_date', todayStr);
      } catch (err) {
        console.error('Failed to undo last swipe:', err);
      }
    }

    lastSwipedRef.current = null;
  };

  const allTags = ['All', ...new Set(deck.flatMap((r) => r.tags || []))].slice(
    0,
    7,
  );

  return (
    <div className="flex-1 flex flex-col justify-between p-4 max-w-md mx-auto w-full relative min-h-[82vh] pb-32">
      {/* Top Filter Bar */}
      <TopFilterBar
        allTags={allTags}
        tagFilter={tagFilter}
        setTagFilter={setTagFilter}
      />

      {/* Main Card Stack Container */}
      <div className="flex-1 flex items-center justify-center relative my-2 min-h-[460px]">
        {loading ? (
          <LoadingState text="Loading today's meal stack..." />
        ) : availableCards.length > 0 ? (
          <div className="relative w-full h-[460px] flex items-center justify-center">
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
                  onSelectDetail={setSelectedRecipeDetail}
                  registerSwipeTrigger={(fn) => {
                    if (index === 0) swipeTopCardRef.current = fn;
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty Deck State */
          <EmptyDeckState
            onNavigateToCookbook={onNavigateToCookbook}
            handleResetSwipes={handleResetSwipes}
          />
        )}
      </div>

      {/* Swipe Action Buttons */}
      {availableCards.length > 0 && (
        <div className="flex items-center justify-center gap-6 py-3 z-10">
          {/* Pass Button (Swipes LEFT / NO) */}
          <PassBtn
            swipeTopCardRef={swipeTopCardRef}
            handleSwipe={handleSwipe}
            currentTopCard={currentTopCard}
          />

          {/* Reset / Undo */}
          <ResetUndoBtn onReset={handleResetSwipes} />

          {/* Like Button (Swipes RIGHT / YES) */}
          <LikeBtn
            swipeTopCardRef={swipeTopCardRef}
            handleSwipe={handleSwipe}
            currentTopCard={currentTopCard}
          />
        </div>
      )}

      {/* IT'S A MATCH OVERLAY */}
      <AnimatePresence>
        {matchedRecipe && (
          <ItsAMatchOverlay
            matchedRecipe={matchedRecipe}
            setMatchedRecipe={setMatchedRecipe}
            setSelectedRecipeDetail={setSelectedRecipeDetail}
          />
        )}
      </AnimatePresence>

      {/* Recipe Detail Modal */}
      {selectedRecipeDetail && (
        <RecipeDetailModal
          selectedRecipeDetail={selectedRecipeDetail}
          setSelectedRecipeDetail={setSelectedRecipeDetail}
        />
      )}
    </div>
  );
}
