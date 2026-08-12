import { useState, useEffect } from "react";
import {
  supabase,
  isConfigured,
  INITIAL_RECIPE_PRESETS,
  searchTheMealDB,
} from "../../lib/supabaseClient";

import TopSubNav from "./TopSubNav";
import DetailModal from "./DetailModal";
import DiscoverMeals from "./DicoverMeals";
import AddRecipe from "./AddRecipe";
import CookBookView from "./CookBookView";

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
      <TopSubNav
        recipes={recipes}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
      />

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: HOUSEHOLD COOKBOOK VIEW                                */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === "cookbook" && (
        <CookBookView
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredRecipes={filteredRecipes}
          setSelectedRecipe={setSelectedRecipe}
          handleDeleteRecipe={handleDeleteRecipe}
          setActiveSubTab={setActiveSubTab}
        />
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
