"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ShoppingCart, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ShoppingListItem {
  id: string;
  ingredient_name: string;
  quantity: string;
  recipe_title?: string;
  is_completed: boolean;
  created_at: string;
}

export function ShoppingList() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  
  const supabase = createClient();

  // Toggle item completion
  const toggleItemCompletion = async (itemId: string, completed: boolean) => {
    setUpdatingItems(prev => new Set([...prev, itemId]));
    
    try {
      const { error } = await supabase
        .from('shopping_list')
        .update({ is_completed: completed })
        .eq('id', itemId);

      if (error) throw error;

      // Update local state
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, is_completed: completed } : item
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Remove item from shopping list
  const removeItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set([...prev, itemId]));
    
    try {
      const { error } = await supabase
        .from('shopping_list')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      // Update local state
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Clear completed items
  const clearCompleted = async () => {
    const completedIds = items.filter(item => item.is_completed).map(item => item.id);
    if (completedIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('shopping_list')
        .delete()
        .in('id', completedIds);

      if (error) throw error;

      // Update local state
      setItems(prev => prev.filter(item => !item.is_completed));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear completed items');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("Please log in to view your shopping list");
          return;
        }

        const { data, error } = await supabase
          .from('shopping_list')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setItems(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shopping list');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [supabase]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedItems = items.filter(item => item.is_completed);
  const pendingItems = items.filter(item => !item.is_completed);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping List
            </CardTitle>
            {completedItems.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearCompleted}
              >
                Clear Completed
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto h-12 w-12 text-foreground/30 mb-4" />
              <p className="text-foreground/60">Your shopping list is empty</p>
              <p className="text-sm text-foreground/40 mt-1">
                Generate recipes and add ingredients to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pending Items */}
              {pendingItems.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-foreground/70 mb-2">
                    TO BUY ({pendingItems.length})
                  </h4>
                  <div className="space-y-2">
                    {pendingItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-background border rounded-lg"
                      >
                        <Checkbox
                          checked={item.is_completed}
                          onCheckedChange={(checked) =>
                            toggleItemCompletion(item.id, checked as boolean)
                          }
                          disabled={updatingItems.has(item.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.ingredient_name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {item.quantity}
                            </Badge>
                          </div>
                          {item.recipe_title && (
                            <p className="text-xs text-foreground/50 mt-1">
                              For: {item.recipe_title}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={updatingItems.has(item.id)}
                        >
                          {updatingItems.has(item.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Items */}
              {completedItems.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-foreground/70 mb-2">
                    COMPLETED ({completedItems.length})
                  </h4>
                  <div className="space-y-2">
                    {completedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-foreground/5 border rounded-lg opacity-60"
                      >
                        <Checkbox
                          checked={item.is_completed}
                          onCheckedChange={(checked) =>
                            toggleItemCompletion(item.id, checked as boolean)
                          }
                          disabled={updatingItems.has(item.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium line-through">
                              {item.ingredient_name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {item.quantity}
                            </Badge>
                          </div>
                          {item.recipe_title && (
                            <p className="text-xs text-foreground/50 mt-1">
                              For: {item.recipe_title}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={updatingItems.has(item.id)}
                        >
                          {updatingItems.has(item.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
