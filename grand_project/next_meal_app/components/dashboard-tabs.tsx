"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, BookOpen, ShoppingCart, Settings } from "lucide-react";
import { IngredientInput } from "@/components/ingredient-input";
import { ApplianceSelector } from "@/components/appliance-selector";
import { RecipeGenerator } from "@/components/recipe-generator";
import { SavedRecipes } from "@/components/saved-recipes";
import { ShoppingList } from "@/components/shopping-list";

type TabType = "kitchen" | "generate" | "saved" | "shopping";

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState<TabType>("kitchen");

  const tabs = [
    {
      id: "kitchen" as TabType,
      label: "My Kitchen",
      icon: Settings,
      description: "Manage ingredients and appliances"
    },
    {
      id: "generate" as TabType,
      label: "Generate Recipe",
      icon: ChefHat,
      description: "Create AI-powered recipes"
    },
    {
      id: "saved" as TabType,
      label: "Saved Recipes",
      icon: BookOpen,
      description: "View your saved recipes"
    },
    {
      id: "shopping" as TabType,
      label: "Shopping List",
      icon: ShoppingCart,
      description: "Manage your shopping list"
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "kitchen":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Kitchen</h1>
              <p className="text-foreground/70">Add your ingredients and cooking equipment to get personalized recipe suggestions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Ingredients Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  🧾 My Ingredients
                </h2>
                <IngredientInput />
              </div>

              {/* Appliances Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  🔧 Available Appliances
                </h2>
                <ApplianceSelector />
              </div>
            </div>
          </div>
        );

      case "generate":
        return (
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Generate Recipe</h1>
              <p className="text-foreground/70">Create AI-powered recipes based on your ingredients and appliances</p>
            </div>
            <RecipeGenerator />
          </div>
        );

      case "saved":
        return (
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Saved Recipes</h1>
              <p className="text-foreground/70">View and manage your saved recipes</p>
            </div>
            <SavedRecipes />
          </div>
        );

      case "shopping":
        return (
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Shopping List</h1>
              <p className="text-foreground/70">Manage your shopping list for recipes</p>
            </div>
            <ShoppingList />
          </div>
        );

      default:
        return null;
    }
  };

  const getTabBackgroundClass = (tabId: TabType) => {
    switch (tabId) {
      case "kitchen": return "kitchen-gradient";
      case "generate": return "recipe-gradient";  
      case "saved": return "saved-gradient";
      case "shopping": return "shopping-gradient";
      default: return "";
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-700 ${getTabBackgroundClass(activeTab)} food-pattern`}>
      <div className="space-y-6 backdrop-blur-sm bg-white/10 dark:bg-black/20 min-h-screen p-6">
        {/* Tab Navigation */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-white/20 dark:border-gray-700/30">
          <CardContent className="p-2">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 h-auto py-3 px-4"
                >
                  <IconComponent className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs opacity-70 hidden sm:block">
                      {tab.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg border border-white/20 dark:border-gray-700/30 p-6">
          {renderTabContent()}
        </div>
      </div>
      </div>
    </div>
  );
}
