-- Recipe Saving and Shopping List Database Schema

-- Saved Recipes Table
CREATE TABLE IF NOT EXISTS saved_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  cooking_time TEXT,
  difficulty TEXT,
  servings TEXT,
  ingredients_used TEXT[], -- Array of ingredients used for this recipe
  appliances_used TEXT[], -- Array of appliances used for this recipe
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping List Items Table
CREATE TABLE IF NOT EXISTS shopping_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity TEXT,
  recipe_title TEXT, -- Optional: which recipe this ingredient is for
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe Shares Table (for sharing functionality)
CREATE TABLE IF NOT EXISTS recipe_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES saved_recipes(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_shares ENABLE ROW LEVEL SECURITY;

-- Saved Recipes Policies
CREATE POLICY "Users can view their own saved recipes" ON saved_recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved recipes" ON saved_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved recipes" ON saved_recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved recipes" ON saved_recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Shopping List Policies
CREATE POLICY "Users can view their own shopping list" ON shopping_list
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shopping list items" ON shopping_list
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping list items" ON shopping_list
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping list items" ON shopping_list
  FOR DELETE USING (auth.uid() = user_id);

-- Recipe Shares Policies
CREATE POLICY "Anyone can view public recipe shares" ON recipe_shares
  FOR SELECT USING (is_public = true);

CREATE POLICY "Recipe owners can manage shares" ON recipe_shares
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM saved_recipes 
      WHERE saved_recipes.id = recipe_shares.recipe_id 
      AND saved_recipes.user_id = auth.uid()
    )
  );

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_created_at ON saved_recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shopping_list_user_id ON shopping_list(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_completed ON shopping_list(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_recipe_shares_token ON recipe_shares(share_token);
