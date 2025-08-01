-- Migration: Add Recipe Saving and Shopping List Tables
-- Execute this in Supabase SQL Editor

-- Create saved_recipes table
CREATE TABLE IF NOT EXISTS saved_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  cooking_time TEXT,
  difficulty TEXT,
  servings TEXT,
  ingredients_used TEXT[],
  appliances_used TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shopping_list table  
CREATE TABLE IF NOT EXISTS shopping_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity TEXT,
  recipe_title TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;

-- Saved Recipes Policies
DROP POLICY IF EXISTS "Users can view their own saved recipes" ON saved_recipes;
DROP POLICY IF EXISTS "Users can insert their own saved recipes" ON saved_recipes;
DROP POLICY IF EXISTS "Users can update their own saved recipes" ON saved_recipes;
DROP POLICY IF EXISTS "Users can delete their own saved recipes" ON saved_recipes;

CREATE POLICY "Users can view their own saved recipes" ON saved_recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved recipes" ON saved_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved recipes" ON saved_recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved recipes" ON saved_recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Shopping List Policies
DROP POLICY IF EXISTS "Users can view their own shopping list" ON shopping_list;
DROP POLICY IF EXISTS "Users can insert their own shopping list items" ON shopping_list;
DROP POLICY IF EXISTS "Users can update their own shopping list items" ON shopping_list;
DROP POLICY IF EXISTS "Users can delete their own shopping list items" ON shopping_list;

CREATE POLICY "Users can view their own shopping list" ON shopping_list
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shopping list items" ON shopping_list
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping list items" ON shopping_list
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping list items" ON shopping_list
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_created_at ON saved_recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shopping_list_user_id ON shopping_list(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_completed ON shopping_list(user_id, is_completed);
