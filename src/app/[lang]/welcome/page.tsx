import { Gate } from "@/components/AppShell";
import { Welcome } from "@/components/Welcome";

export default function WelcomePage() {
  return (
    <Gate allowPending>
      <Welcome />
    </Gate>
  );
}
