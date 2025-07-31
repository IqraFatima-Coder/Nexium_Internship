"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChefHat, Clock, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Recipe {
  title: string;
  content: string;
  time?: string;
  difficulty?: string;
  servings?: string;
}

export function RecipeGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  
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
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate recipe: ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('n8n response:', result); // Debug log
      
      // Parse the AI response - handle multiple response formats
      let aiResponse = '';
      
      if (Array.isArray(result)) {
        // If result is an array, take the first response
        const firstResponse = result[0];
        aiResponse = firstResponse?.choices?.[0]?.message?.content || 
                    firstResponse?.response || 
                    'No recipe generated';
      } else {
        // If result is a single object
        aiResponse = result?.choices?.[0]?.message?.content || 
                    result?.response || 
                    'No recipe generated';
      }
      
      console.log('Extracted AI response:', aiResponse); // Debug log
      
      // Extract recipe information from markdown-formatted response
      const recipe: Recipe = {
        title: extractValue(aiResponse, 'RECIPE:') || 'Generated Recipe',
        content: aiResponse,
        time: extractValue(aiResponse, 'TIME:'),
        difficulty: extractValue(aiResponse, 'DIFFICULTY:'),
        servings: extractValue(aiResponse, 'SERVINGS:')
      };

      setRecipes([recipe, ...recipes]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recipe');
      console.error('Recipe generation error:', err);
    } finally {
      setIsGenerating(false);
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
              Generating Recipe...
            </>
          ) : (
            <>
              <ChefHat className="mr-2 h-4 w-4" />
              Generate Recipe
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
          <h3 className="text-xl font-semibold">🤖 AI Generated Recipes</h3>
          {recipes.map((recipe, index) => (
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
                  <Button variant="outline" size="sm">
                    💾 Save Recipe
                  </Button>
                  <Button variant="outline" size="sm">
                    📤 Share
                  </Button>
                  <Button variant="outline" size="sm">
                    🛒 Add to Shopping List
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
