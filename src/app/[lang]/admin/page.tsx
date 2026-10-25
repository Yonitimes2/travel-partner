import { Gate } from "@/components/AppShell";
import { Admin } from "@/components/Admin";

export default function AdminPage() {
  return (
    <Gate>
      <Admin />
    </Gate>
  );
}
