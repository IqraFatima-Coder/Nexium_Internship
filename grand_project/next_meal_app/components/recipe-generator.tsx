"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, ChefHat, Clock, Users, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Recipe {
  id?: string; // Add optional id for saved recipes
  title: string;
  content: string;
  time?: string;
  difficulty?: string;
  servings?: string;
  ingredients?: string[]; // Add ingredients used
  appliances?: string[]; // Add appliances used
  isSaved?: boolean; // Track if recipe is saved
}

export function RecipeGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savingRecipes, setSavingRecipes] = useState<Set<number>>(new Set());
  const [addingToCart, setAddingToCart] = useState<Set<number>>(new Set());
  
  const supabase = createClient();

  const generateRecipe = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Please log in to generate recipes");
      }

      // Get user's ingredients and appliances
      const [ingredientsResult, appliancesResult] = await Promise.all([
        supabase.from('ingredients').select('name').eq('user_id', user.id),
        supabase.from('appliances').select('name').eq('user_id', user.id)
      ]);

      if (ingredientsResult.error) throw ingredientsResult.error;
      if (appliancesResult.error) throw appliancesResult.error;

      const ingredients = ingredientsResult.data?.map(item => item.name) || [];
      const appliances = appliancesResult.data?.map(item => item.name) || [];

      if (ingredients.length === 0) {
        throw new Error("Please add some ingredients first");
      }

      // Call n8n webhook
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
      if (!webhookUrl) {
        throw new Error("Recipe generation service not configured");
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          ingredients,
          appliances,
          options: {
            generate_multiple: true,
            recipe_count: 3,
            use_all_ingredients: false
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate recipe: ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('n8n response:', result); // Debug log
      
      // Parse multiple recipes from AI response
      let generatedRecipes: Recipe[] = [];
      
      if (Array.isArray(result)) {
        // Handle array of recipe responses
        generatedRecipes = result.slice(0, 3).map((item, index) => {
          const aiResponse = item?.choices?.[0]?.message?.content || 
                            item?.response || 
                            `Recipe ${index + 1}`;
          
          return {
            title: extractValue(aiResponse, 'RECIPE:') || `Generated Recipe ${index + 1}`,
            content: aiResponse,
            time: extractValue(aiResponse, 'TIME:'),
            difficulty: extractValue(aiResponse, 'DIFFICULTY:'),
            servings: extractValue(aiResponse, 'SERVINGS:'),
            ingredients: ingredients,
            appliances: appliances,
            isSaved: false
          };
        });
      } else {
        // Single recipe response - try to split if contains multiple recipes
        const aiResponse = result?.choices?.[0]?.message?.content || 
                          result?.response || 
                          'No recipe generated';
        
        // Check if response contains multiple recipes (split by "RECIPE:" markers)
        const recipeSections = aiResponse.split(/(?=RECIPE:)/i).filter((section: string) => section.trim());
        
        if (recipeSections.length > 1) {
          generatedRecipes = recipeSections.slice(0, 3).map((section: string, index: number) => ({
            title: extractValue(section, 'RECIPE:') || `Generated Recipe ${index + 1}`,
            content: section,
            time: extractValue(section, 'TIME:'),
            difficulty: extractValue(section, 'DIFFICULTY:'),
            servings: extractValue(section, 'SERVINGS:'),
            ingredients: ingredients,
            appliances: appliances,
            isSaved: false
          }));
        } else {
          // Single recipe
          generatedRecipes = [{
            title: extractValue(aiResponse, 'RECIPE:') || 'Generated Recipe',
            content: aiResponse,
            time: extractValue(aiResponse, 'TIME:'),
            difficulty: extractValue(aiResponse, 'DIFFICULTY:'),
            servings: extractValue(aiResponse, 'SERVINGS:'),
            ingredients: ingredients,
            appliances: appliances,
            isSaved: false
          }];
        }
      }
      
      console.log('Generated recipes:', generatedRecipes); // Debug log
      
      setRecipes([...generatedRecipes, ...recipes]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recipe');
      console.error('Recipe generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save recipe to database
  const saveRecipe = async (recipeIndex: number) => {
    const recipe = recipes[recipeIndex];
    if (!recipe || recipe.isSaved) return;

    setSavingRecipes(prev => new Set([...prev, recipeIndex]));
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in to save recipes");

      const { data, error } = await supabase
        .from('saved_recipes')
        .insert({
          user_id: user.id,
          title: recipe.title,
          content: recipe.content,
          cooking_time: recipe.time,
          difficulty: recipe.difficulty,
          servings: recipe.servings,
          ingredients_used: recipe.ingredients || [],
          appliances_used: recipe.appliances || []
        })
        .select()
        .single();

      if (error) throw error;

      // Update the recipe in state to mark as saved
      const updatedRecipes = [...recipes];
      updatedRecipes[recipeIndex] = { 
        ...recipe, 
        id: data.id, 
        isSaved: true 
      };
      setRecipes(updatedRecipes);

      console.log('✅ Recipe saved successfully to database!');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recipe');
    } finally {
      setSavingRecipes(prev => {
        const newSet = new Set(prev);
        newSet.delete(recipeIndex);
        return newSet;
      });
    }
  };

  // Add ingredients to shopping list
  const addToShoppingList = async (recipeIndex: number) => {
    const recipe = recipes[recipeIndex];
    if (!recipe || !recipe.ingredients) return;

    setAddingToCart(prev => new Set([...prev, recipeIndex]));
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in to add to shopping list");

      // Parse ingredients from recipe content to extract quantities
      const ingredientItems = parseIngredientsFromContent(recipe.content);
      
      const { error } = await supabase
        .from('shopping_list')
        .insert(
          ingredientItems.map(item => ({
            user_id: user.id,
            ingredient_name: item.name,
            quantity: item.quantity,
            recipe_title: recipe.title
          }))
        );

      if (error) throw error;

      console.log('✅ Added to shopping list successfully!');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to shopping list');
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(recipeIndex);
        return newSet;
      });
    }
  };

  // Parse ingredients from recipe content
  const parseIngredientsFromContent = (content: string) => {
    const lines = content.split('\n');
    const ingredients: Array<{name: string, quantity: string}> = [];
    let inIngredientsSection = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if we're entering ingredients section
      if (trimmedLine.toLowerCase().includes('ingredients') && trimmedLine.includes('**')) {
        inIngredientsSection = true;
        continue;
      }
      
      // Check if we're leaving ingredients section
      if (inIngredientsSection && trimmedLine.includes('**') && !trimmedLine.toLowerCase().includes('ingredients')) {
        break;
      }
      
      // Parse ingredient line
      if (inIngredientsSection && (trimmedLine.startsWith('•') || trimmedLine.startsWith('-'))) {
        let ingredientText = trimmedLine.substring(1).trim();
        
        // Remove leading comma if present
        if (ingredientText.startsWith(',')) {
          ingredientText = ingredientText.substring(1).trim();
        }
        
        // Try to extract quantity and ingredient name
        const match = ingredientText.match(/^([0-9/\s]+\w+)?\s*(.+)$/);
        if (match && match[2]) {
          const quantity = match[1]?.trim() || '1';
          const name = match[2].trim();
          
          if (name) {
            ingredients.push({
              name: name,
              quantity: quantity
            });
          }
        } else if (ingredientText) {
          ingredients.push({
            name: ingredientText,
            quantity: '1'
          });
        }
      }
    }

    return ingredients;
  };

  // Share recipe functionality
  const shareRecipe = async (recipeIndex: number) => {
    const recipe = recipes[recipeIndex];
    if (!recipe) return;

    try {
      // For now, copy to clipboard. Later we can implement proper sharing
      const shareText = `🍴 ${recipe.title}\n\n${recipe.content}\n\nGenerated by NextMeal AI`;
      await navigator.clipboard.writeText(shareText);
      console.log('✅ Recipe copied to clipboard successfully!');
      
      // Show temporary success message (could be replaced with toast later)
      setError(null); // Clear any existing errors
      
      // You could add a toast notification here instead
      const button = document.querySelector(`[data-recipe-index="${recipeIndex}"]`);
      if (button) {
        const originalText = button.textContent;
        button.textContent = '✅ Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy recipe:', err);
      setError('Failed to copy recipe to clipboard');
    }
  };

  // Helper function to extract values from markdown text
  const extractValue = (text: string, label: string): string | undefined => {
    const regex = new RegExp(`\\*\\*${label}\\*\\*\\s*([^\\n*]+)`, 'i');
    const match = text.match(regex);
    return match?.[1]?.trim();
  };

  // Format recipe content for display
  const formatRecipeContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        // Bold headers
        if (line.startsWith('**') && line.endsWith('**')) {
          return <h3 key={index} className="font-semibold text-lg mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
        }
        // List items
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          return <li key={index} className="ml-4">{line.trim().substring(1).trim()}</li>;
        }
        // Numbers steps
        if (/^\d+\./.test(line.trim())) {
          return <div key={index} className="mb-2 font-medium">{line.trim()}</div>;
        }
        // Regular text
        if (line.trim()) {
          return <p key={index} className="mb-2">{line}</p>;
        }
        return null;
      })
      .filter(Boolean);
  };

  return (
    <div className="space-y-6">
      {/* Generate Button */}
      <div className="flex justify-center">
        <Button 
          onClick={generateRecipe} 
          disabled={isGenerating}
          size="lg"
          className="px-8"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Recipes...
            </>
          ) : (
            <>
              <ChefHat className="mr-2 h-4 w-4" />
              Generate Recipe Options
            </>
          )}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Recipes Display */}
      {recipes.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">🤖 AI Generated Recipes ({recipes.length})</h3>
          
          {/* Hybrid Approach: Accordion if multiple recipes, Cards if single */}
          {recipes.length > 1 ? (
            <Accordion type="single" className="w-full space-y-4">
              {recipes.map((recipe, index) => (
                <AccordionItem key={index} value={index.toString()} className="border rounded-lg">
                  <AccordionTrigger className="hover:no-underline px-4">
                    <div className="flex justify-between items-center w-full mr-4">
                      <div className="flex items-center gap-3 text-left">
                        <span className="font-semibold text-lg">{recipe.title}</span>
                        <div className="flex gap-2">
                          {recipe.time && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {recipe.time}
                            </Badge>
                          )}
                          {recipe.difficulty && (
                            <Badge variant="outline">
                              {recipe.difficulty}
                            </Badge>
                          )}
                          {recipe.servings && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {recipe.servings}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="prose prose-sm max-w-none mt-4">
                      {formatRecipeContent(recipe.content)}
                    </div>
                    <div className="flex gap-2 mt-6 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => saveRecipe(index)}
                        disabled={savingRecipes.has(index) || recipe.isSaved}
                      >
                        {savingRecipes.has(index) ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Saving...
                          </>
                        ) : recipe.isSaved ? (
                          <>
                            <Check className="mr-1 h-3 w-3" />
                            Saved
                          </>
                        ) : (
                          <>
                            💾 Save Recipe
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => shareRecipe(index)}
                      >
                        📋 Copy Recipe
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => addToShoppingList(index)}
                        disabled={addingToCart.has(index)}
                      >
                        {addingToCart.has(index) ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            🛒 Add to Shopping List
                          </>
                        )}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            // Single recipe - show in full Card format
            recipes.map((recipe, index) => (
            <Card key={index} className="w-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{recipe.title}</CardTitle>
                  <div className="flex gap-2">
                    {recipe.time && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {recipe.time}
                      </Badge>
                    )}
                    {recipe.difficulty && (
                      <Badge variant="outline">
                        {recipe.difficulty}
                      </Badge>
                    )}
                    {recipe.servings && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {recipe.servings}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {formatRecipeContent(recipe.content)}
                </div>
                <div className="flex gap-2 mt-6 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => saveRecipe(index)}
                    disabled={savingRecipes.has(index) || recipe.isSaved}
                  >
                    {savingRecipes.has(index) ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Saving...
                      </>
                    ) : recipe.isSaved ? (
                      <>
                        <Check className="mr-1 h-3 w-3" />
                        Saved
                      </>
                    ) : (
                      <>
                        💾 Save Recipe
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => shareRecipe(index)}
                  >
                    � Copy Recipe
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => addToShoppingList(index)}
                    disabled={addingToCart.has(index)}
                  >
                    {addingToCart.has(index) ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        🛒 Add to Shopping List
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>
      )}

      {/* Empty State */}
      {recipes.length === 0 && !error && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <ChefHat className="mx-auto h-12 w-12 text-foreground/30 mb-4" />
              <p className="text-foreground/60">No recipes generated yet</p>
              <p className="text-sm text-foreground/40 mt-1">
                Add some ingredients and click &ldquo;Generate Recipe&rdquo; to get started
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
