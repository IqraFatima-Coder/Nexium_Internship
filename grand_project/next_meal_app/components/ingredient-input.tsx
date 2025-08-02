"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function IngredientInput() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const supabase = createClient();

  // Load existing ingredients
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('❌ No user found for ingredients');
          return;
        }

        console.log('🔍 Loading ingredients for user:', user.id);

        const { data, error } = await supabase
          .from('ingredients')
          .select('name')
          .eq('user_id', user.id);

        if (error) {
          console.error('❌ Error loading ingredients:', error);
          throw error;
        }

        console.log('✅ Loaded ingredients:', data);
        setIngredients(data?.map(item => item.name) || []);
      } catch (error) {
        console.error('Error loading ingredients:', error);
      }
    };

    loadIngredients();
  }, [supabase]);

  const addIngredient = async () => {
    if (!newIngredient.trim()) return;
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found');
        return;
      }

      console.log('Adding ingredient for user:', user.id);

      const { data, error } = await supabase
        .from('ingredients')
        .insert({ 
          user_id: user.id, 
          name: newIngredient.trim(),
          type: 'fridge',
          quantity: '1 unit'
        })
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Successfully added ingredient:', data);
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    } catch (error) {
      console.error('Error adding ingredient:', error);
      // Show user-friendly error
      alert(`Failed to add ingredient: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const removeIngredient = async (ingredientToRemove: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('user_id', user.id)
        .eq('name', ingredientToRemove);

      if (error) throw error;
      
      setIngredients(ingredients.filter(ing => ing !== ingredientToRemove));
    } catch (error) {
      console.error('Error removing ingredient:', error);
    }
  };

  const clearAllIngredients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      
      setIngredients([]);
    } catch (error) {
      console.error('Error clearing ingredients:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add ingredient input */}
      <div className="flex gap-2">
        <Input
          placeholder="Add ingredients (e.g., chicken, rice, carrots)"
          value={newIngredient}
          onChange={(e) => setNewIngredient(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
          className="flex-1"
        />
        <Button 
          onClick={addIngredient} 
          disabled={isLoading || !newIngredient.trim()}
          size="icon"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Ingredients list */}
      <div className="border rounded-lg p-4 min-h-[200px]">
        {ingredients.length === 0 ? (
          <div className="text-center text-foreground/50 py-8">
            <p>🧾 No ingredients added yet</p>
            <p className="text-sm">Add ingredients to get personalized recipes</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-sm">My Ingredients ({ingredients.length})</h4>
              <Badge variant="outline" className="text-xs">
                Synced with database
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="flex items-center gap-1 px-3 py-1 text-sm"
                >
                  🥕 {ingredient}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500 ml-1" 
                    onClick={() => removeIngredient(ingredient)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearAllIngredients}
          disabled={ingredients.length === 0}
        >
          🗑️ Clear All
        </Button>
        <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
          ✅ Auto-saved to database
        </Badge>
      </div>
    </div>
  );
}
