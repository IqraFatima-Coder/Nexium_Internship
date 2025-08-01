// Database setup script to create tables programmatically
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service role key for schema operations

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database tables...')

    // Create saved_recipes table
    const { error: savedRecipesError } = await supabase.rpc('create_saved_recipes_table')
    if (savedRecipesError && !savedRecipesError.message.includes('already exists')) {
      console.error('Error creating saved_recipes table:', savedRecipesError)
    }

    // Create shopping_list table
    const { error: shoppingListError } = await supabase.rpc('create_shopping_list_table')
    if (shoppingListError && !shoppingListError.message.includes('already exists')) {
      console.error('Error creating shopping_list table:', shoppingListError)
    }

    console.log('✅ Database setup complete!')
  } catch (error) {
    console.error('❌ Database setup failed:', error)
  }
}

// Run setup
setupDatabase()
