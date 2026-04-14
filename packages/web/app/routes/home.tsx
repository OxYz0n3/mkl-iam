import { useOutletContext } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";
import { Button } from "~/components/ui/button"

import type { GetTenantsResponse } from "@mkl-iam/back/src/tenants/model";
import type { User } from "@mkl-iam/back/src/auth/model";

import { app } from "~/lib/api";
import { getToken } from "~/lib/auth";


export default function Home()
{
  const { user } = useOutletContext() as { user: User };
  const [ tenants, setTenants ] = useState<GetTenantsResponse>([]);

  useEffect(() => {
    app.tenants.get({ headers: { 'Authorization': `Bearer ${ getToken() }` } })
      .then(({ data, error }) => {
        if (!error)
          setTenants(data)
        else
          toast.error("Une erreur est survenue lors du chargement des entreprises");
      })
      .catch(() => toast.error("Une erreur est survenue lors du chargement des entreprises"));
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar user={user} tenants={tenants} />
      <div className="flex min-h-svh p-6">
        <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
          <div>
            <h1 className="font-medium">Project ready!</h1>
            <p>You may now add components and start building.</p>
            <p>We&apos;ve already added the button component for you.</p>
            <Button className="mt-2">Button</Button>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
