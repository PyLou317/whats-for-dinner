import React, { useState, useEffect, useMemo } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  supabase,
  isConfigured,
  fetchHouseholdMatches,
  deleteHouseholdMatch,
  ensureHouseholdRecipes,
  INITIAL_RECIPE_PRESETS,
} from './lib/supabaseClient';

import Auth from './pages/profile/Auth.jsx';
import SwipeDeck from './pages/swipeDeck/SwipeDeck.jsx';
import RecipeManager from './pages/recipeManager/RecipeManager.jsx';
import MatchHistory from './pages/matches/MatchHistory.jsx';
import Navbar from './components/navbar/Navbar.jsx';
import BottomNav from './components/navbar/BottomNav.jsx';
import OnboardingPage from './pages/onboarding/OnboardingPage.jsx';

export default function App() {
  const [matchCount, setMatchCount] = useState(0);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState(INITIAL_RECIPE_PRESETS);
  const [matches, setMatches] = useState([]);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const isOnboardingRoute = location.pathname === '/onboarding';
  const isMatchesRoute = location.pathname === '/matches';

  const activeTab = useMemo(() => {
    if (location.pathname === '/cookbook') return 'cookbook';
    if (location.pathname === '/matches') return 'matches';
    if (location.pathname === '/profile') return 'profile';
    return 'swipe';
  }, [location.pathname]);

  const setActiveTab = (tab) => {
    if (tab === 'cookbook') return navigate('/cookbook');
    if (tab === 'matches') return navigate('/matches');
    if (tab === 'profile') return navigate('/profile');
    return navigate('/');
  };

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
        .maybeSingle();

      if (error || !prof) {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setRecipes(INITIAL_RECIPE_PRESETS);
        setMatches([]);
        return;
      }

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

        const existingMatches = await fetchHouseholdMatches(prof.household_id);
        setMatches(existingMatches);

        // New-user check: no swipes yet => onboarding
        const { data: mySwipes } = await supabase
          .from('swipes')
          .select('id')
          .eq('household_id', prof.household_id)
          .eq('user_id', userId)
          .limit(1);

        const isNewUser = !mySwipes || mySwipes.length === 0;
        if (isNewUser) {
          navigate('/onboarding', { replace: true });
        } else if (location.pathname === '/' || location.pathname === '') {
          navigate('/', { replace: true });
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
    const demoUser = { id: 'demo-user-1', email };
    const demoProfile = {
      id: 'demo-user-1',
      email,
      display_name: name,
      household_id: 'demo-household-123',
      invite_code: 'DIN-9X2Y',
      partner_name: 'Alex (Partner)',
    };

    setUser(demoUser);
    setProfile(demoProfile);
    setRecipes(INITIAL_RECIPE_PRESETS);
    setLoadingAuth(false);
    navigate('/', { replace: true });
  };

  const handleAddMatch = async (recipe) => {
    if (!recipe?.id) return;
    if (matches.some((m) => m.id === recipe.id)) return;
    setMatches((prev) => [recipe, ...prev]);
  };

  const handleUndoMatch = async (matchId, matchItem) => {
    const recipeId = matchItem?.id ?? matchId;
    setMatches((prev) => prev.filter((m, idx) => (m.id ?? idx) !== recipeId));

    try {
      if (isConfigured && profile?.household_id && recipeId) {
        await deleteHouseholdMatch(profile.household_id, recipeId);
      }
    } catch (err) {
      console.error('Failed to undo match:', err);
      if (profile?.household_id) {
        const latest = await fetchHouseholdMatches(profile.household_id);
        setMatches(latest);
      }
    }
  };

  useEffect(() => {
    if (!isConfigured) return;
    if (!isMatchesRoute) return;
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
  }, [isMatchesRoute, profile?.household_id]);

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
      {!isOnboardingRoute && (
        <>
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-rose-500/10 blur-[120px] pointer-events-none rounded-full" />
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={user}
            profile={profile}
            matchCount={matchCount}
            onOpenProfile={() => navigate('/profile')}
          />
        </>
      )}

      <main className="flex-1 flex flex-col">
        <Routes>
          <Route
            path="/"
            element={
              <SwipeDeck
                user={user}
                profile={profile}
                recipes={recipes}
                onAddMatch={handleAddMatch}
                onNavigateToCookbook={() => navigate('/cookbook')}
              />
            }
          />
          <Route path="/swipe" element={<Navigate to="/" replace />} />
          <Route
            path="/cookbook"
            element={
              <RecipeManager
                user={user}
                profile={profile}
                recipes={recipes}
                onRecipesChange={(updated) => setRecipes(updated)}
              />
            }
          />
          <Route
            path="/matches"
            element={
              <MatchHistory
                matches={matches}
                onSelectRecipe={() => navigate('/')}
                onMatchCountChange={setMatchCount}
                onUndoMatch={handleUndoMatch}
              />
            }
          />
          <Route
            path="/profile"
            element={
              <Auth
                user={user}
                profile={profile}
                onProfileUpdate={(updatedProf) => setProfile(updatedProf)}
                onDemoLogin={handleDemoLogin}
                onCloseProfile={() => navigate('/')}
              />
            }
          />
          <Route
            path="/onboarding"
            element={
              <OnboardingPage
                user={user}
                profile={profile}
                recipes={recipes}
                onAddMatch={handleAddMatch}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isOnboardingRoute && <BottomNav />}
    </div>
  );
}
