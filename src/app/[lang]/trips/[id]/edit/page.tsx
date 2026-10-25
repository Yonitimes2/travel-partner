import { Suspense } from "react";
import { Gate } from "@/components/AppShell";
import { EditTrip } from "@/components/EditTrip";

export default function EditTripPage({ params }: PageProps<"/[lang]/trips/[id]/edit">) {
  return (
    <Suspense>
      <Edit params={params} />
    </Suspense>
  );
}

async function Edit({ params }: Pick<PageProps<"/[lang]/trips/[id]/edit">, "params">) {
  const { id } = await params;
  return (
    <Gate>
      <EditTrip id={id} />
    </Gate>
  );
}
