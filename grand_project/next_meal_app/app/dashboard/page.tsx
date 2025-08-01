import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardTabs } from "../../components/dashboard-tabs";
import { AuthButton } from "../../components/auth-button";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/30 dark:from-blue-950/10 dark:via-gray-900 dark:to-indigo-950/10">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-gradient-to-r from-blue-50/50 via-transparent to-blue-50/50 dark:from-blue-950/20 dark:via-transparent dark:to-blue-950/20 backdrop-blur-sm">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href="/" className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 transition-colors">NextMeal 🍲</Link>
          </div>
          <AuthButton />
        </div>
      </nav>
      
      <main className="flex-1 w-full max-w-5xl mx-auto p-6">
        <DashboardTabs />
      </main>
    </div>
  );
}
