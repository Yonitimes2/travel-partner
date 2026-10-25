import { Welcome } from "@/components/Welcome";

/** not behind <Gate>: signed-out people land here, and the screen handles every state itself */
export default function WelcomePage() {
  return <Welcome />;
}
