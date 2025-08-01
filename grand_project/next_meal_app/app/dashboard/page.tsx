import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardTabs } from "../../components/dashboard-tabs";
import Link from "next/link";

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
            <Link href="/">NextMeal 🍲</Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-foreground/70">Welcome back!</span>
            <a href="/auth/logout" className="text-foreground/70 hover:text-foreground">Logout</a>
          </div>
        </div>
      </nav>
      
      <main className="flex-1 w-full max-w-5xl mx-auto p-6">
        <DashboardTabs />
      </main>
    </div>
  );
}
