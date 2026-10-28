import { Gate } from "@/components/AppShell";
import { Feed, HomeHero } from "@/components/Feed";

export default function TripsPage() {
  return (
    <>
      {/* the photo and headline come first, without waiting for the trips */}
      <HomeHero />
      <Gate>
        <Feed />
      </Gate>
    </>
  );
}
