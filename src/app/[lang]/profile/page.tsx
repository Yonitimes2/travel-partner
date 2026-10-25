import { Gate } from "@/components/AppShell";
import { Profile } from "@/components/Profile";

export default function ProfilePage() {
  return (
    <Gate>
      <Profile />
    </Gate>
  );
}
