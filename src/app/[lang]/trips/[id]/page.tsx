import { Suspense } from "react";
import { Gate } from "@/components/AppShell";
import { TripView } from "@/components/TripView";

export default function TripPage({ params }: PageProps<"/[lang]/trips/[id]">) {
  return (
    <Suspense>
      <Trip params={params} />
    </Suspense>
  );
}

async function Trip({ params }: Pick<PageProps<"/[lang]/trips/[id]">, "params">) {
  const { id } = await params;
  return (
    <Gate>
      <TripView id={id} />
    </Gate>
  );
}
