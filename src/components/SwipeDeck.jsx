import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, animate } from 'framer-motion';
import confetti from 'canvas-confetti';
import { supabase, isConfigured, INITIAL_RECIPE_PRESETS, ensureHouseholdRecipes } from '../lib/supabaseClient';
import { 
  Heart, 
  X, 
  Sparkles, 
  Clock, 
  Utensils, 
  RotateCcw, 
  BookOpen, 
  ChefHat, 
  Info,
  CheckCircle2
} from 'lucide-react';

export default function SwipeDeck({ user, profile, recipes = [], onAddMatch, onNavigateToCookbook }) {
  const [deck, setDeck] = useState([]);
  const [swipedRecipeIds, setSwipedRecipeIds] = useState(new Set());
  const [userSwipes, setUserSwipes] = useState({}); // recipeId -> 'yes'|'no'
  const [partnerSwipes, setPartnerSwipes] = useState({}); // recipeId -> 'yes'|'no'
  const [matchedRecipe, setMatchedRecipe] = useState(null);
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);
  const [tagFilter, setTagFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const isAnimatingRef = useRef(false);

  const userSwipesRef = useRef(userSwipes);
  useEffect(() => {
    userSwipesRef.current = userSwipes;
  }, [userSwipes]);

  const deckRef = useRef(deck);
  useEffect(() => {
    deckRef.current = deck;
  }, [deck]);

  // Motion values for top card
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacity = useTransform(x, [-350, -200, 0, 200, 350], [0.2, 1, 1, 1, 0.2]);
  const likeBadgeOpacity = useTransform(x, [15, 90], [0, 1]);
  const passBadgeOpacity = useTransform(x, [-15, -90], [0, 1]);

  // Helper for consistent local timezone YYYY-MM-DD string
  const getLocalDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    const timer = setTimeout(() => {
      checkDateChange();
    }, msUntilMidnight);

    const interval = setInterval(checkDateChange, 60000); // Also check every minute in case tab was sleeping

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [todayStr]);

  // 2. Load initial recipes & existing swipes for today
  useEffect(() => {
    fetchTodaySwipesAndRecipes();
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

              if (newSwipe.decision === 'yes' && userSwipesRef.current[newSwipe.recipe_id] === 'yes') {
                const match = deckRef.current.find((r) => r.id === newSwipe.recipe_id);
                if (match) triggerMatchOverlay(match);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.household_id, user?.id, todayStr]);

  const fetchTodaySwipesAndRecipes = async () => {
    setLoading(true);
    let allRecipes = recipes.length > 0 ? recipes : INITIAL_RECIPE_PRESETS;
    let mySwiped = new Set();
    let mySwipesObj = {};
    let partnerSwipesObj = {};

    const storageKey = `whats_for_dinner_swipes_${user?.id || 'demo'}_${todayStr}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        JSON.parse(saved).forEach((id) => mySwiped.add(id));
      }
    } catch (e) {}

    if (isConfigured && profile?.household_id) {
      try {
        allRecipes = await ensureHouseholdRecipes(profile.household_id, user?.id);

        const { data: dbSwipes } = await supabase
          .from('swipes')
          .select('*')
          .eq('household_id', profile.household_id)
          .eq('swipe_date', todayStr);

        if (dbSwipes) {
          dbSwipes.forEach((s) => {
            if (s.user_id === user?.id) {
              mySwiped.add(s.recipe_id);
              mySwipesObj[s.recipe_id] = s.decision;
            } else {
              partnerSwipesObj[s.recipe_id] = s.decision;
            }
          });
        }
      } catch (err) {
        console.error('Error fetching swipes:', err);
      }
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(mySwiped)));
    } catch (e) {}

    setDeck(allRecipes);
    setSwipedRecipeIds(mySwiped);
    setUserSwipes(mySwipesObj);
    setPartnerSwipes(partnerSwipesObj);
    setLoading(false);
  };

  const availableCards = deck.filter((recipe) => {
    if (swipedRecipeIds.has(recipe.id)) return false;
    if (tagFilter !== 'All' && !recipe.tags?.includes(tagFilter)) return false;
    return true;
  });

  const currentTopCard = availableCards[0];

  // Robust Swipe Handler (Supports both Drag & Button Clicks)
  const handleSwipe = (decision, forcedDirection = null) => {
    if (!currentTopCard || isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    // Determine direction: 'right' for YES (+600px), 'left' for NO (-600px)
    const dir = forcedDirection || (decision === 'yes' ? 'right' : decision === 'no' ? 'left' : (x.get() >= 0 ? 'right' : 'left'));
    const targetX = dir === 'right' ? 600 : -600;
    const recipeId = currentTopCard.id;

    // 1. Animate card smoothly off screen
    animate(x, targetX, {
      duration: 0.22,
      ease: [0.4, 0, 0.2, 1],
    });

    // 2. Commit swipe state after animation completes
    setTimeout(async () => {
      setSwipedRecipeIds((prev) => {
        const next = new Set([...prev, recipeId]);
        try {
          const storageKey = `whats_for_dinner_swipes_${user?.id || 'demo'}_${todayStr}`;
          localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
        } catch (e) {}
        return next;
      });

      const updatedUserSwipes = { ...userSwipes, [recipeId]: decision };
      setUserSwipes(updatedUserSwipes);
      
      // Reset position for next card
      x.set(0);
      isAnimatingRef.current = false;

      // Insert swipe into Supabase if configured
      if (isConfigured && profile?.household_id && user?.id) {
        try {
          await supabase.from('swipes').upsert({
            household_id: profile.household_id,
            recipe_id: recipeId,
            user_id: user.id,
            decision,
            swipe_date: todayStr,
          });
        } catch (err) {
          console.error('Failed to record swipe:', err);
        }
      }

      // Match Detection check
      if (decision === 'yes' && partnerSwipes[recipeId] === 'yes') {
        triggerMatchOverlay(currentTopCard);
      }
    }, 220);
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

  const simulatePartnerSwipe = (recipeId) => {
    const updatedPartnerSwipes = { ...partnerSwipes, [recipeId]: 'yes' };
    setPartnerSwipes(updatedPartnerSwipes);

    if (userSwipes[recipeId] === 'yes') {
      const match = deck.find((r) => r.id === recipeId);
      if (match) triggerMatchOverlay(match);
    }
  };

  const handleResetSwipes = async () => {
    setSwipedRecipeIds(new Set());
    setUserSwipes({});
    setPartnerSwipes({});
    x.set(0);
    isAnimatingRef.current = false;

    try {
      const storageKey = `whats_for_dinner_swipes_${user?.id || 'demo'}_${todayStr}`;
      localStorage.removeItem(storageKey);
    } catch (e) {}

    if (isConfigured && profile?.household_id && user?.id) {
      try {
        await supabase
          .from('swipes')
          .delete()
          .eq('household_id', profile.household_id)
          .eq('user_id', user.id)
          .eq('swipe_date', todayStr);
      } catch (err) {
        console.error('Failed to reset swipes in database:', err);
      }
    }
  };


  const allTags = ['All', ...new Set(deck.flatMap((r) => r.tags || []))].slice(0, 7);

  return (
    <div className="flex-1 flex flex-col justify-between p-4 max-w-md mx-auto w-full relative min-h-[82vh] pb-32">
      {/* Top Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none z-10 mb-2">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setTagFilter(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
              tagFilter === tag
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                : 'glass-panel text-slate-300 hover:bg-slate-800'
            }`}
          >
            {tag === 'All' && <ChefHat className="w-3.5 h-3.5" />}
            {tag}
          </button>
        ))}
      </div>

      {/* Main Card Stack Container */}
      <div className="flex-1 flex items-center justify-center relative my-2 min-h-[460px]">
        {loading ? (
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-rose-500 border-t-transparent mx-auto" />
            <p className="text-sm text-slate-400">Loading today's meal stack...</p>
          </div>
        ) : availableCards.length > 0 ? (
          <div className="relative w-full h-[460px] flex items-center justify-center">
            <AnimatePresence>
              {availableCards.slice(0, 3).map((recipe, index) => {
                const isTop = index === 0;

                return (
                  <motion.div
                    key={recipe.id}
                    style={{
                      zIndex: availableCards.length - index,
                      x: isTop ? x : 0,
                      rotate: isTop ? rotate : 0,
                      opacity: isTop ? opacity : 1 - index * 0.15,
                      scale: 1 - index * 0.05,
                      y: index * 12,
                    }}
                    drag={isTop ? 'x' : false}
                    onDragEnd={(e, info) => {
                      if (!isTop) return;
                      if (info.offset.x > 80 || info.velocity.x > 300) {
                        handleSwipe('yes', 'right');
                      } else if (info.offset.x < -80 || info.velocity.x < -300) {
                        handleSwipe('no', 'left');
                      } else {
                        animate(x, 0, { type: 'spring', stiffness: 300, damping: 20 });
                      }
                    }}
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1 - index * 0.05, opacity: 1, y: index * 12 }}
                    className="absolute inset-0 rounded-3xl glass-panel overflow-hidden shadow-2xl border border-slate-700/60 flex flex-col justify-between cursor-grab active:cursor-grabbing select-none"
                  >
                    {/* Top Recipe Image */}
                    <div className="relative h-64 w-full overflow-hidden bg-slate-900">
                      <img
                        src={recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                        loading="eager"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <span className="px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-amber-400 text-xs font-bold border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {recipe.prep_time || '20 mins'}
                        </span>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecipeDetail(recipe);
                          }}
                          className="p-2 rounded-full bg-slate-950/70 backdrop-blur-md text-white hover:text-rose-400 border border-white/20 pointer-events-auto transition-all"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Drag Status Overlay Badges */}
                      {isTop && (
                        <>
                          <motion.div
                            style={{ opacity: likeBadgeOpacity }}
                            className="absolute top-8 left-6 rotate-[-15deg] border-4 border-emerald-400 text-emerald-400 px-4 py-1.5 rounded-2xl font-black text-2xl tracking-wider uppercase bg-emerald-950/80 backdrop-blur-sm pointer-events-none shadow-2xl"
                          >
                            YES! 💚
                          </motion.div>
                          <motion.div
                            style={{ opacity: passBadgeOpacity }}
                            className="absolute top-8 right-6 rotate-[15deg] border-4 border-rose-500 text-rose-500 px-4 py-1.5 rounded-2xl font-black text-2xl tracking-wider uppercase bg-rose-950/80 backdrop-blur-sm pointer-events-none shadow-2xl"
                          >
                            PASS 💔
                          </motion.div>
                        </>
                      )}
                    </div>

                    {/* Card Content Footer */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-slate-900/90">
                      <div>
                        <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                          {recipe.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                          {recipe.instructions || 'Delicious homecooked meal recipe ready to prepare.'}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {recipe.tags?.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700/60"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      {/* Simulated Partner Interaction pill */}
                      {isTop && (
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" />
                            Partner status:
                          </span>
                          {partnerSwipes[recipe.id] === 'yes' ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Swiped YES!
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                simulatePartnerSwipe(recipe.id);
                              }}
                              className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
                            >
                              Simulate Partner Swipe
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty Deck State */
          <div className="glass-panel p-8 rounded-3xl text-center space-y-4 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">All Swiped for Today! 🎉</h3>
              <p className="text-xs text-slate-400 mt-1">
                You've reviewed all available recipes in your deck. Check your matches or reset to swipe again.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={onNavigateToCookbook}
                className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl text-xs shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <BookOpen className="w-4 h-4" />
                Add More Recipes in Cookbook
              </button>
              <button
                onClick={handleResetSwipes}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Today's Swipes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Swipe Action Buttons */}
      {availableCards.length > 0 && (
        <div className="flex items-center justify-center gap-6 py-3 z-10">
          {/* Pass Button (Swipes LEFT / NO) */}
          <button
            onClick={() => handleSwipe('no', 'left')}
            className="w-16 h-16 rounded-full bg-slate-900 hover:bg-rose-950/80 text-rose-400 border-2 border-rose-500/30 flex items-center justify-center shadow-lg shadow-rose-950/40 active-press transition-all hover:scale-105"
            title="Pass / No"
          >
            <X className="w-7 h-7 stroke-[3]" />
          </button>

          {/* Reset / Undo */}
          <button
            onClick={handleResetSwipes}
            className="w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-700 flex items-center justify-center active-press transition-all"
            title="Reset Swipes"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Like Button (Swipes RIGHT / YES) */}
          <button
            onClick={() => handleSwipe('yes', 'right')}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-xl shadow-rose-500/30 flex items-center justify-center active-press transition-all hover:scale-105"
            title="Like / Yes"
          >
            <Heart className="w-8 h-8 fill-white" />
          </button>
        </div>
      )}

      {/* IT'S A MATCH OVERLAY */}
      <AnimatePresence>
        {matchedRecipe && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl"
          >
            <div className="w-full max-w-sm glass-panel p-6 rounded-3xl border-2 border-rose-500/50 shadow-2xl text-center space-y-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400" />

              <div className="space-y-1">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 mb-2 animate-bounce">
                  <Sparkles className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight gradient-text-rose">
                  It's a Match! 🎉
                </h2>
                <p className="text-xs text-slate-300 font-medium">
                  Both you and your partner swiped YES on tonight's meal!
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-inner space-y-3 p-3">
                <img
                  src={matchedRecipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                  alt={matchedRecipe.title}
                  className="w-full h-44 object-cover rounded-xl"
                />
                <div className="text-left space-y-1">
                  <h3 className="font-bold text-white text-lg">{matchedRecipe.title}</h3>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      {matchedRecipe.prep_time || '25 mins'}
                    </span>
                    <span className="text-emerald-400 font-semibold">Ready to Cook</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    const recipe = matchedRecipe;
                    setMatchedRecipe(null);
                    setSelectedRecipeDetail(recipe);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 active-press transition-all"
                >
                  <Utensils className="w-4 h-4" />
                  View Recipe Instructions
                </button>
                <button
                  onClick={() => setMatchedRecipe(null)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs border border-slate-700 transition-all"
                >
                  Keep Swiping
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RECIPE DETAIL MODAL */}
      <AnimatePresence>
        {selectedRecipeDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setSelectedRecipeDetail(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md glass-panel rounded-3xl max-h-[85vh] overflow-y-auto border border-slate-700/80 shadow-2xl relative"
            >
              <div className="relative h-56 w-full">
                <img
                  src={selectedRecipeDetail.image_url}
                  alt={selectedRecipeDetail.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedRecipeDetail(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/70 text-white hover:text-rose-400 border border-white/20 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedRecipeDetail.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                      <Clock className="w-4 h-4" />
                      {selectedRecipeDetail.prep_time}
                    </span>
                    <span className="flex items-center gap-1 text-rose-400 font-semibold">
                      <ChefHat className="w-4 h-4" />
                      {selectedRecipeDetail.tags?.join(', ')}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-rose-400" />
                    Instructions & Preparation
                  </h4>
                  <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                    {selectedRecipeDetail.instructions || 'No step-by-step instructions available.'}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
