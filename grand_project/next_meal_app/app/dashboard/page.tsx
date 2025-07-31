import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IngredientInput } from "@/components/ingredient-input";
import { ApplianceSelector } from "@/components/appliance-selector";
import { RecipeGenerator } from "@/components/recipe-generator";

export default async function Dashboard() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <a href="/">NextMeal 🍲</a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-foreground/70">Welcome back!</span>
            <a href="/auth/logout" className="text-foreground/70 hover:text-foreground">Logout</a>
          </div>
        </div>
      </nav>
      
      <main className="flex-1 w-full max-w-5xl mx-auto p-6">
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

          {/* Recipe Generation Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              🤖 Generate Recipe
            </h2>
            <RecipeGenerator />
          </div>
        </div>
      </main>
    </div>
  );
}
