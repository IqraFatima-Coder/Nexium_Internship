import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { ProfileDropdown } from "./profile-dropdown";

export async function AuthButton() {
  const supabase = await createClient();

  // Get user data to access username
  const { data: { user } } = await supabase.auth.getUser();

  return user ? (
    <ProfileDropdown />
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
