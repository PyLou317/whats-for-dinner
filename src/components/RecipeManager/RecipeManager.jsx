import { useState, useEffect } from "react";
import {
  supabase,
  isConfigured,
  INITIAL_RECIPE_PRESETS,
  searchTheMealDB,
} from "../../lib/supabaseClient";
import {
  BookOpen,
  PlusCircle,
  Compass,
  Search,
  Clock,
  Check,
  Trash2,
  Utensils,
  Plus,
  ChefHat,
} from "lucide-react";

import DetailModal from "./DetailModal";
import DiscoverMeals from "./DicoverMeals";
import AddRecipe from "./AddRecipe";

export default function RecipeManager({
  user,
  profile,
  recipes = [],
  onRecipesChange,
}) {
  const [activeSubTab, setActiveSubTab] = useState("cookbook"); // 'cookbook' | 'add' | 'discover'
  const [searchQuery, setSearchQuery] = useState("");
  const [discoverQuery, setDiscoverQuery] = useState("");
  const [discoverResults, setDiscoverResults] = useState([]);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [clonedIds, setClonedIds] = useState(new Set());
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Form State for Custom Recipe
  const [title, setTitle] = useState("");
  const [prepTime, setPrepTime] = useState("20 mins");
  const [tagsInput, setTagsInput] = useState("Quick, High Protein");
  const [imageUrl, setImageUrl] = useState("");
  const [instructions, setInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState(null);

  // Load online discover results on tab switch
  useEffect(() => {
    if (activeSubTab === "discover") {
      handleSearchDiscover();
    }
  }, [activeSubTab]);

  // Search external MealDB API
  const handleSearchDiscover = async (e) => {
    if (e) e.preventDefault();
    setDiscoverLoading(true);
    const results = await searchTheMealDB(discoverQuery);
    setDiscoverResults(results.length > 0 ? results : INITIAL_RECIPE_PRESETS);
    setDiscoverLoading(false);
  };

  // Add Custom Recipe into Household Cookbook
  const handleAddCustomRecipe = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setFormMsg(null);

    const tagsArray = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const defaultImg =
      imageUrl.trim() ||
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";

    const newRecipeData = {
      id: `custom-${Date.now()}`,
      household_id: profile?.household_id || "demo-household-123",
      title: title.trim(),
      prep_time: prepTime || "20 mins",
      tags: tagsArray,
      image_url: defaultImg,
      instructions:
        instructions.trim() ||
        "No specific step-by-step instructions provided.",
      created_by: user?.id || null,
    };

    if (isConfigured && profile?.household_id) {
      try {
        const { data, error } = await supabase
          .from("recipes")
          .insert([
            {
              household_id: profile.household_id,
              title: newRecipeData.title,
              prep_time: newRecipeData.prep_time,
              tags: newRecipeData.tags,
              image_url: newRecipeData.image_url,
              instructions: newRecipeData.instructions,
              created_by: user?.id,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        if (data) newRecipeData.id = data.id;
      } catch (err) {
        console.error("Error creating custom recipe:", err);
      }
    }

    onRecipesChange([...recipes, newRecipeData]);
    setSubmitting(false);
    setFormMsg("Recipe added to your Household Cookbook! 🎉");

    // Reset form
    setTitle("");
    setImageUrl("");
    setInstructions("");
    setTimeout(() => {
      setFormMsg(null);
      setActiveSubTab("cookbook");
    }, 1200);
  };

  // Clone item from Discover into Household Cookbook
  const handleCloneToCookbook = async (item) => {
    setClonedIds((prev) => new Set([...prev, item.id]));

    const clonedRecipe = {
      id: `cloned-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      household_id: profile?.household_id || "demo-household-123",
      title: item.title,
      prep_time: item.prep_time || "25 mins",
      tags: item.tags || ["MealDB"],
      image_url: item.image_url,
      instructions: item.instructions,
      created_by: user?.id || null,
    };

    if (isConfigured && profile?.household_id) {
      try {
        const { data, error } = await supabase
          .from("recipes")
          .insert([
            {
              household_id: profile.household_id,
              title: clonedRecipe.title,
              prep_time: clonedRecipe.prep_time,
              tags: clonedRecipe.tags,
              image_url: clonedRecipe.image_url,
              instructions: clonedRecipe.instructions,
              created_by: user?.id,
            },
          ])
          .select()
          .single();

        if (data) clonedRecipe.id = data.id;
      } catch (err) {
        console.error("Failed to clone recipe to DB:", err);
      }
    }

    onRecipesChange([...recipes, clonedRecipe]);
  };

  // Delete recipe from Household Cookbook
  const handleDeleteRecipe = async (recipeId) => {
    if (isConfigured && profile?.household_id) {
      try {
        await supabase.from("recipes").delete().eq("id", recipeId);
      } catch (err) {
        console.error("Error deleting recipe:", err);
      }
    }
    onRecipesChange(recipes.filter((r) => r.id !== recipeId));
  };

  // Filter cookbook recipes by search query
  const filteredRecipes = recipes.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full space-y-4 min-h-[82vh] pb-32">
      {/* Top Sub-Navigation Tabs */}
      <div className="flex rounded-2xl glass-panel p-1 border border-slate-800">
        <button
          onClick={() => setActiveSubTab("cookbook")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === "cookbook"
              ? "bg-rose-500 text-white shadow-md shadow-rose-500/25"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Cookbook ({recipes.length})
        </button>
        <button
          onClick={() => setActiveSubTab("add")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === "add"
              ? "bg-rose-500 text-white shadow-md shadow-rose-500/25"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Add Custom
        </button>
        <button
          onClick={() => setActiveSubTab("discover")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === "discover"
              ? "bg-rose-500 text-white shadow-md shadow-rose-500/25"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          Discover API
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: HOUSEHOLD COOKBOOK VIEW                                */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === "cookbook" && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search recipes by title or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/70 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {filteredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="glass-panel-interactive p-3.5 rounded-2xl flex items-center gap-3 relative group"
                >
                  <img
                    src={
                      recipe.image_url ||
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={recipe.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0 pr-6 space-y-1">
                    <h4 className="font-bold text-white text-sm truncate">
                      {recipe.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="text-amber-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {recipe.prep_time}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {recipe.tags?.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedRecipe(recipe)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                      title="View Details"
                    >
                      <Utensils className="w-4 h-4 text-rose-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteRecipe(recipe.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-all"
                      title="Delete Recipe"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-3xl text-center space-y-3">
              <ChefHat className="w-12 h-12 text-slate-500 mx-auto" />
              <h4 className="font-bold text-white text-base">
                No Recipes Found
              </h4>
              <p className="text-xs text-slate-400">
                Add custom recipes or discover trending meals to populate your
                cookbook!
              </p>
              <button
                onClick={() => setActiveSubTab("discover")}
                className="mt-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl text-xs inline-flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                Discover Recipes
              </button>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: ADD CUSTOM RECIPE                                      */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === "add" && (
        <AddRecipe
          title={title}
          setTitle={setTitle}
          prepTime={prepTime}
          setPrepTime={setPrepTime}
          tagsInput={tagsInput}
          setTagsInput={setTagsInput}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          instructions={instructions}
          setInstructions={setInstructions}
          handleAddCustomRecipe={handleAddCustomRecipe}
          submitting={submitting}
          formMsg={formMsg}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: DISCOVER RECIPES FROM THEMEALDB API                    */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === "discover" && (
        <DiscoverMeals
          discoverQuery={discoverQuery}
          setDiscoverQuery={setDiscoverQuery}
          discoverLoading={discoverLoading}
          discoverResults={discoverResults}
          handleSearchDiscover={handleSearchDiscover}
          handleCloneToCookbook={handleCloneToCookbook}
          clonedIds={clonedIds}
          recipes={recipes}
        />
      )}

      {/* Detail Modal */}
      {selectedRecipe && (
        <DetailModal
          selectedRecipe={selectedRecipe}
          setSelectedRecipe={setSelectedRecipe}
        />
      )}
    </div>
  );
}
