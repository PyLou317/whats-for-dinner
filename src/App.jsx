import React, { useState, useEffect } from 'react';
import {
  supabase,
  isConfigured,
  fetchHouseholdMatches,
  deleteHouseholdMatch,
  ensureHouseholdRecipes,
  INITIAL_RECIPE_PRESETS, // keep only if this is actually exported
} from './lib/supabaseClient';
import Auth from './pages/profile/Auth.jsx';
import SwipeDeck from './pages/swipeDeck/SwipeDeck.jsx';
import RecipeManager from './pages/recipeManager/RecipeManager.jsx';
import MatchHistory from './pages/matches/MatchHistory.jsx';
import Navbar from './pages/navbar/Navbar.jsx';

export default function App() {
  const [matchCount, setMatchCount] = useState(0);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState(INITIAL_RECIPE_PRESETS);
  const [matches, setMatches] = useState([]);
  const [activeTab, setActiveTab] = useState('swipe');
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Listen for Supabase Auth changes
  useEffect(() => {
    if (!isConfigured) {
      setLoadingAuth(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user.id);
      } else {
        setLoadingAuth(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setLoadingAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data: prof, error } = await supabase
        .from('profiles')
        .select('*, households(invite_code)')
        .eq('id', userId)
        .single();

      if (prof) {
        setProfile({
          ...prof,
          invite_code: prof.households?.invite_code || null,
        });

        if (prof.household_id) {
          const householdRecipes = await ensureHouseholdRecipes(
            prof.household_id,
            userId,
          );
          setRecipes(householdRecipes);

          const existingMatches = await fetchHouseholdMatches(
            prof.household_id,
          );
          setMatches(existingMatches);
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoadingAuth(false);
    }
  };

  useEffect(() => {
    setMatchCount(matches.length);
  }, [matches]);

  const handleDemoLogin = (email = 'couple@demo.app', name = 'Partner 1') => {
    const demoUser = {
      id: 'demo-user-1',
      email: email,
    };
    const demoProfile = {
      id: 'demo-user-1',
      email: email,
      display_name: name,
      household_id: 'demo-household-123',
      invite_code: 'DIN-9X2Y',
      partner_name: 'Alex (Partner)',
    };
    setUser(demoUser);
    setProfile(demoProfile);
    setRecipes(INITIAL_RECIPE_PRESETS);
    setLoadingAuth(false);
  };

  const handleAddMatch = async (recipe) => {
    if (!recipe?.id) return;
    if (matches.some((m) => m.id === recipe.id)) return;

    // UI-only: swipe persistence happens in SwipeDeck
    setMatches((prev) => [recipe, ...prev]);
  };

  const handleUndoMatch = async (matchId, matchItem) => {
    const recipeId = matchItem?.id ?? matchId;

    // optimistic UI update
    setMatches((prev) => prev.filter((m, idx) => (m.id ?? idx) !== recipeId));

    try {
      if (isConfigured && profile?.household_id && recipeId) {
        await deleteHouseholdMatch(profile.household_id, recipeId);
      }
    } catch (err) {
      console.error('Failed to undo match:', err);
      // resync from backend on failure
      if (profile?.household_id) {
        const latest = await fetchHouseholdMatches(profile.household_id);
        setMatches(latest);
      }
    }
  };

  useEffect(() => {
    if (!isConfigured) return;
    if (activeTab !== 'matches') return;
    if (!profile?.household_id) return;

    let cancelled = false;

    const refreshMatches = async () => {
      const latest = await fetchHouseholdMatches(profile.household_id);
      if (!cancelled) setMatches(latest);
    };

    refreshMatches();

    return () => {
      cancelled = true;
    };
  }, [activeTab, profile?.household_id]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent mb-3" />
        <p className="text-sm font-semibold text-slate-400">
          Loading What's For Dinner...
        </p>
      </div>
    );
  }

  // Not logged in or needs household onboarding
  if (!user || !profile?.household_id) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 selection:bg-rose-500 selection:text-white">
        <Auth
          user={user}
          profile={profile}
          onProfileUpdate={(updatedProf) => setProfile(updatedProf)}
          onDemoLogin={handleDemoLogin}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 relative pb-36 selection:bg-rose-500 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-rose-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        profile={profile}
        matchCount={matchCount}
        onOpenProfile={() => setActiveTab('profile')}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'swipe' && (
          <SwipeDeck
            user={user}
            profile={profile}
            recipes={recipes}
            onAddMatch={handleAddMatch}
            onNavigateToCookbook={() => setActiveTab('cookbook')}
          />
        )}

        {activeTab === 'cookbook' && (
          <RecipeManager
            user={user}
            profile={profile}
            recipes={recipes}
            onRecipesChange={(updated) => setRecipes(updated)}
          />
        )}

        {activeTab === 'matches' && (
          <MatchHistory
            matches={matches}
            onSelectRecipe={() => setActiveTab('swipe')}
            onMatchCountChange={setMatchCount}
            onUndoMatch={handleUndoMatch} // <-- add
          />
        )}

        {activeTab === 'profile' && (
          <Auth
            user={user}
            profile={profile}
            onProfileUpdate={(updatedProf) => setProfile(updatedProf)}
            onDemoLogin={handleDemoLogin}
            onCloseProfile={() => setActiveTab('swipe')}
          />
        )}
      </main>
    </div>
  );
}
