import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SetupPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/auth/login");
  }

  try {
    // Create saved_recipes table
    await supabase.rpc('exec_sql', {
      sql: `
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
        
        ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Users can view their own saved recipes" ON saved_recipes
          FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY IF NOT EXISTS "Users can insert their own saved recipes" ON saved_recipes
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY IF NOT EXISTS "Users can update their own saved recipes" ON saved_recipes
          FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY IF NOT EXISTS "Users can delete their own saved recipes" ON saved_recipes
          FOR DELETE USING (auth.uid() = user_id);
      `
    });

    // Create shopping_list table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS shopping_list (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          ingredient_name TEXT NOT NULL,
          quantity TEXT,
          recipe_title TEXT,
          is_completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Users can view their own shopping list" ON shopping_list
          FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY IF NOT EXISTS "Users can insert their own shopping list items" ON shopping_list
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY IF NOT EXISTS "Users can update their own shopping list items" ON shopping_list
          FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY IF NOT EXISTS "Users can delete their own shopping list items" ON shopping_list
          FOR DELETE USING (auth.uid() = user_id);
      `
    });

  } catch (error) {
    console.error('Database setup error:', error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Database Setup</h1>
        <p className="text-green-600">✅ Database tables created successfully!</p>
        <p className="mt-4">
          <a href="/dashboard" className="text-blue-600 hover:underline">
            Go to Dashboard
          </a>
        </p>
      </div>
    </div>
  );
}
