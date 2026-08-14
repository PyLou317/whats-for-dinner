import {
  supabase,
  ensureHouseholdRecipes,
  INITIAL_RECIPE_PRESETS,
} from "../lib/supabaseClient";

const fetchTodaySwipesAndRecipes = async ({
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
}) => {
  setLoading(true);
  let allRecipes = recipes.length > 0 ? recipes : INITIAL_RECIPE_PRESETS;
  let mySwiped = new Set();
  let mySwipesObj = {};
  let partnerSwipesObj = {};

  const storageKey = `whats_for_dinner_swipes_${user?.id || "demo"}_${todayStr}`;
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
        .from("swipes")
        .select("*")
        .eq("household_id", profile.household_id)
        .eq("swipe_date", todayStr);

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
      console.error("Error fetching swipes:", err);
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

export default fetchTodaySwipesAndRecipes;
