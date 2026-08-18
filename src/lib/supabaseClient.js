import { createClient } from '@supabase/supabase-js';

// Read env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Determine if Supabase credentials are correctly provided
export const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('YOUR_SUPABASE_URL') &&
  !supabaseUrl.includes('example.supabase.co'),
);

// Fallback dummy client if not configured to prevent instant crashes
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient(
      'https://placeholder-project.supabase.co',
      'placeholder-anon-key',
    );

// Helper to generate a 6-character uppercase alphanumeric code
export function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'DIN-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Preset default recipes for new households or initial discovery
export const INITIAL_RECIPE_PRESETS = [
  {
    id: 'preset-1',
    title: 'Creamy Garlic Butter Salmon',
    prep_time: '25 mins',
    tags: ['Seafood', 'Quick', 'Romantic', 'Keto'],
    image_url:
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    instructions:
      '1. Season salmon fillets with salt, pepper, and paprika.\n2. Sear in a hot skillet with olive oil for 4 minutes per side until golden.\n3. Remove salmon, reduce heat, and add butter, minced garlic, chicken broth, and heavy cream.\n4. Simmer until sauce thickens, toss in fresh spinach and cherry tomatoes.\n5. Return salmon to skillet, spoon sauce over top, and serve warm with lemon slices.',
  },
  {
    id: 'preset-2',
    title: 'Homemade Margherita Pizza',
    prep_time: '35 mins',
    tags: ['Italian', 'Vegetarian', 'Comfort Food', 'Fun'],
    image_url:
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
    instructions:
      '1. Preheat oven to 475°F (245°C) with a pizza stone inside.\n2. Stretch pizza dough onto a floured surface.\n3. Spread high-quality San Marzano tomato sauce thinly over dough.\n4. Top with sliced fresh mozzarella and torn basil leaves.\n5. Drizzle with extra virgin olive oil and bake for 10-12 minutes until crust is blistered and golden.',
  },
  {
    id: 'preset-3',
    title: 'Honey Garlic Chicken & Veggie Bowls',
    prep_time: '20 mins',
    tags: ['Healthy', 'Quick', 'High Protein', 'Asian-Style'],
    image_url:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    instructions:
      '1. Cut chicken breast into bite-sized cubes.\n2. In a bowl, whisk honey, soy sauce, minced garlic, ginger, and cornstarch.\n3. Sauté chicken in sesame oil until cooked through.\n4. Pour in sauce and simmer until sticky and glazed.\n5. Serve over fluffy jasmine rice with steamed broccoli, edamame, and toasted sesame seeds.',
  },
  {
    id: 'preset-4',
    title: 'Creamy Tuscan Wild Mushroom Risotto',
    prep_time: '40 mins',
    tags: ['Comfort Food', 'Vegetarian', 'Romantic', 'Gluten-Free'],
    image_url:
      'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80',
    instructions:
      '1. Sauté sliced cremini and shiitake mushrooms in butter with thyme until caramelized; set aside.\n2. In a deep skillet, sauté shallots and garlic, add Arborio rice, and toast for 2 minutes.\n3. Deglaze with white wine and stir until absorbed.\n4. Gradually add warm vegetable broth one ladle at a time, stirring constantly.\n5. Stir in mushrooms, grated Parmesan, butter, and truffle oil. Garnish with parsley.',
  },
  {
    id: 'preset-5',
    title: 'Street-Style Beef Tacos with Guacamole',
    prep_time: '20 mins',
    tags: ['Mexican', 'Quick', 'Fun', 'High Protein'],
    image_url:
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80',
    instructions:
      '1. Season flank steak with cumin, chili powder, lime juice, garlic, and cilantro.\n2. Grill or sear on high heat for 3-4 minutes per side for medium-rare; rest and slice thin.\n3. Warm small corn tortillas.\n4. Mash avocados with lime, diced red onion, jalapeño, and salt for fresh guacamole.\n5. Assemble tacos with steak, guac, chopped cilantro, and crumbled cotija cheese.',
  },
  {
    id: 'preset-6',
    title: 'Thai Red Curry Shrimp & Noodles',
    prep_time: '25 mins',
    tags: ['Asian-Style', 'Spicy', 'Seafood', 'Quick'],
    image_url:
      'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
    instructions:
      '1. Heat coconut oil, sauté Thai red curry paste for 1 minute until fragrant.\n2. Pour in full-fat coconut milk and stir until combined.\n3. Add bell peppers, snap peas, and peeled shrimp; simmer for 5 minutes.\n4. Stir in fish sauce, brown sugar, and lime juice.\n5. Serve over rice noodles garnished with Thai basil and crushed peanuts.',
  },
];

// External Meal API Helper (TheMealDB API)
export async function searchTheMealDB(query = '') {
  try {
    const url = query.trim()
      ? `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
      : `https://www.themealdb.com/api/json/v1/1/search.php?s=chicken`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.meals) return [];

    return data.meals.map((meal) => {
      // Collect tags
      const tags = ['MealDB'];
      if (meal.strCategory) tags.push(meal.strCategory);
      if (meal.strArea) tags.push(meal.strArea);
      if (meal.strTags) {
        meal.strTags.split(',').forEach((t) => {
          if (t.trim() && !tags.includes(t.trim())) tags.push(t.trim());
        });
      }

      return {
        id: `mealdb-${meal.idMeal}`,
        title: meal.strMeal,
        prep_time: '30 mins',
        tags: tags.slice(0, 4),
        image_url: meal.strMealThumb,
        instructions:
          meal.strInstructions || 'No detailed instructions provided.',
      };
    });
  } catch (err) {
    console.error('Error searching TheMealDB API:', err);
    return [];
  }
}

// Seed or fetch recipes for a given household ID
export async function ensureHouseholdRecipes(householdId, userId = null) {
  if (!isConfigured || !householdId) return INITIAL_RECIPE_PRESETS;

  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching recipes:', error);
      return INITIAL_RECIPE_PRESETS;
    }

    if (data && data.length > 0) {
      return data;
    }

    // Seed default recipes into DB if household is empty
    const presetsToInsert = INITIAL_RECIPE_PRESETS.map((preset) => ({
      household_id: householdId,
      title: preset.title,
      prep_time: preset.prep_time,
      tags: preset.tags,
      image_url: preset.image_url,
      instructions: preset.instructions,
      created_by: userId,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('recipes')
      .insert(presetsToInsert)
      .select();

    if (insertError) {
      console.error('Error seeding recipes:', insertError);
      return INITIAL_RECIPE_PRESETS;
    }

    return inserted || INITIAL_RECIPE_PRESETS;
  } catch (err) {
    console.error('Error in ensureHouseholdRecipes:', err);
    return INITIAL_RECIPE_PRESETS;
  }
}

// Fetch mutual matches (recipes where 2 users in the household swiped YES today)
export async function fetchHouseholdMatches(householdId, swipeDate = null) {
  if (!isConfigured || !householdId) return [];

  try {
    const dateStr = swipeDate || new Date().toISOString().split('T')[0];

    const { data: swipes, error } = await supabase
      .from('swipes')
      .select('recipe_id, decision, recipes(*)')
      .eq('household_id', householdId)
      .eq('swipe_date', dateStr)
      .eq('decision', 'yes');

    if (error || !swipes) return [];

    const counts = {};
    const recipeMap = {};

    swipes.forEach((s) => {
      if (!s.recipe_id) return;
      counts[s.recipe_id] = (counts[s.recipe_id] || 0) + 1;
      if (s.recipes) recipeMap[s.recipe_id] = s.recipes;
    });

    return Object.keys(counts)
      .filter((id) => counts[id] >= 2)
      .map((id) => recipeMap[id])
      .filter(Boolean);
  } catch (err) {
    console.error('Error in fetchHouseholdMatches:', err);
    return [];
  }
}

// Delete a household match
export async function deleteHouseholdMatch(householdId, recipeId, matchDate) {
  if (!isConfigured) return { data: null, error: null };

  let query = supabase
    .from('matches')
    .delete()
    .eq('household_id', householdId)
    .eq('recipe_id', recipeId);

  if (matchDate) {
    query = query.eq('match_date', matchDate);
  }

  return query;
}
