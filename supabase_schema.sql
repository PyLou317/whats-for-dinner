-- =================================================================
-- WHAT'S FOR DINNER? - SUPABASE DATABASE SCHEMA MIGRATION
-- =================================================================

-- 1. Create Helper Functions
CREATE OR REPLACE FUNCTION generate_invite_code() 
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer := 0;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 2. Households Table
CREATE TABLE IF NOT EXISTS public.households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    invite_code TEXT UNIQUE NOT NULL DEFAULT generate_invite_code()
);

-- 3. Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    household_id UUID REFERENCES public.households(id) ON DELETE SET NULL,
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Recipes Table
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    prep_time TEXT DEFAULT '20 mins',
    tags TEXT[] DEFAULT '{}'::TEXT[],
    image_url TEXT,
    instructions TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. Swipes Table
CREATE TABLE IF NOT EXISTS public.swipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    decision TEXT NOT NULL CHECK (decision IN ('yes', 'no')),
    swipe_date DATE DEFAULT current_date NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT unique_user_recipe_swipe_per_date UNIQUE (user_id, recipe_id, swipe_date)
);

-- Index for fast daily match queries
CREATE INDEX IF NOT EXISTS idx_swipes_household_date ON public.swipes(household_id, swipe_date);
CREATE INDEX IF NOT EXISTS idx_recipes_household ON public.recipes(household_id);

-- =================================================================
-- NON-INLINABLE SECURITY DEFINER HELPER (Fixes RLS Recursion)
-- MUST be LANGUAGE plpgsql so PostgreSQL query planner cannot inline it!
-- =================================================================
CREATE OR REPLACE FUNCTION public.get_my_household_id()
RETURNS UUID 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    h_id UUID;
BEGIN
    SELECT household_id INTO h_id FROM public.profiles WHERE id = auth.uid();
    RETURN h_id;
END;
$$;

-- =================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- =================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================

ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

-- Drop old policies if existing to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile or housemates" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Authenticated users can create a household" ON public.households;
DROP POLICY IF EXISTS "Users can view their household" ON public.households;
DROP POLICY IF EXISTS "Authenticated users can view households" ON public.households;

DROP POLICY IF EXISTS "Household members can view recipes" ON public.recipes;
DROP POLICY IF EXISTS "Household members can insert recipes" ON public.recipes;
DROP POLICY IF EXISTS "Household members can update recipes" ON public.recipes;
DROP POLICY IF EXISTS "Household members can delete recipes" ON public.recipes;

DROP POLICY IF EXISTS "Household members can view swipes" ON public.swipes;
DROP POLICY IF EXISTS "Household members can insert swipes" ON public.swipes;
DROP POLICY IF EXISTS "Users can update/delete their own swipes" ON public.swipes;

-- Profiles Policies
CREATE POLICY "Users can view profiles" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR 
        (household_id IS NOT NULL AND household_id = public.get_my_household_id())
    );

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Households Policies (Authenticated users can create & search/view households)
CREATE POLICY "Authenticated users can create a household" ON public.households
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view households" ON public.households
    FOR SELECT USING (auth.role() = 'authenticated');

-- Recipes Policies
CREATE POLICY "Household members can view recipes" ON public.recipes
    FOR SELECT USING (
        household_id = public.get_my_household_id()
    );

CREATE POLICY "Household members can insert recipes" ON public.recipes
    FOR INSERT WITH CHECK (
        household_id = public.get_my_household_id()
    );

CREATE POLICY "Household members can update recipes" ON public.recipes
    FOR UPDATE USING (
        household_id = public.get_my_household_id()
    );

CREATE POLICY "Household members can delete recipes" ON public.recipes
    FOR DELETE USING (
        household_id = public.get_my_household_id()
    );

-- Swipes Policies
CREATE POLICY "Household members can view swipes" ON public.swipes
    FOR SELECT USING (
        household_id = public.get_my_household_id()
    );

CREATE POLICY "Household members can insert swipes" ON public.swipes
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        household_id = public.get_my_household_id()
    );

CREATE POLICY "Users can update/delete their own swipes" ON public.swipes
    FOR ALL USING (auth.uid() = user_id);

-- =================================================================
-- REALTIME PUBLICATION SETUP
-- =================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'swipes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.swipes;
    END IF;
END $$;
