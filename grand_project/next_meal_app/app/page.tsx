import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>NextMeal 🍲</Link>
            </div>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <Hero />
          <main className="flex-1 flex flex-col gap-6 px-4">
            <h2 className="font-medium text-xl mb-4">Welcome to NextMeal 🍲</h2>
            {hasEnvVars ? (
              <div className="flex flex-col gap-4">
                <p className="text-foreground/70 text-lg">
                  Never wonder &quot;what&apos;s for dinner?&quot; again! Transform your available ingredients into delicious, personalized recipes with our AI-powered cooking assistant.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="font-semibold mb-2 text-lg">🧾 Add Ingredients</h3>
                    <p className="text-sm text-foreground/70">Input what&apos;s in your fridge and pantry</p>
                  </div>
                  <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="font-semibold mb-2 text-lg">🤖 AI Magic</h3>
                    <p className="text-sm text-foreground/70">Get multiple personalized recipe options</p>
                  </div>
                  <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="font-semibold mb-2 text-lg">🍽️ Cook & Enjoy</h3>
                    <p className="text-sm text-foreground/70">Save favorites and add to shopping list</p>
                  </div>
                </div>
                <div className="flex justify-center mt-8">
                  <Link 
                    href="/dashboard" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    Get Started →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-accent rounded-lg">
                <p className="text-sm">Please configure your environment variables to get started.</p>
              </div>
            )}
          </main>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            NextMeal - Your AI Recipe Assistant 🍲
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
