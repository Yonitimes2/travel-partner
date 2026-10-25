"use client";

import { TripForm } from "./NewTripForm";
import { BackButton, Card } from "./ui";
import { useT } from "./Providers";
import { useApp } from "@/lib/store";

/** only the owner can edit a trip */
export function EditTrip({ id }: { id: string }) {
  const { t } = useT();
  const trip = useApp((s) => s.trips.find((tr) => tr.id === id && tr.ownerId === s.meId));
  if (!trip) {
    return (
      <div className="p-4">
        <BackButton to="/my" onDark={false} />
        <Card className="mt-4 py-10 text-center text-muted">{t.trip.notFound}</Card>
      </div>
    );
  }
  return <TripForm trip={trip} />;
}
