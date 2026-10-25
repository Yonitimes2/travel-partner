import { Gate } from "@/components/AppShell";
import { TripForm } from "@/components/NewTripForm";

export default function NewTripPage() {
  return (
    <Gate>
      <TripForm />
    </Gate>
  );
}
