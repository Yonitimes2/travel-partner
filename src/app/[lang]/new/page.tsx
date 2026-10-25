import { Gate } from "@/components/AppShell";
import { NewTripForm } from "@/components/NewTripForm";

export default function NewTripPage() {
  return (
    <Gate>
      <NewTripForm />
    </Gate>
  );
}
