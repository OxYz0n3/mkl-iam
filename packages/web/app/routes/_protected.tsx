import { Outlet, useLoaderData } from "react-router";

import { Spinner } from "@/components/ui/spinner";

import { requireAuth } from "@/lib/auth";


export async function clientLoader() {
  const { user } = await requireAuth();

  return { user };
}

export function HydrateFallback() {
  return (
    <div className="flex h-screen items-center justify-center gap-2 text-md text-muted-foreground">
      <Spinner />
      Chargement en cours...
    </div>
  );
}

export default function ProtectedLayout() {
  const { user } = useLoaderData<typeof clientLoader>();

  return (
    <Outlet context={{ user }} />
  );
}