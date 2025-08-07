import { UserProfile } from "@/components/user-profile";
import { ProtectedRoute } from "@/components/protected-route";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <UserProfile />
    </ProtectedRoute>
  );
}
