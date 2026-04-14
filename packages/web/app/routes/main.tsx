import { Outlet, useOutletContext } from "react-router";
import { LayoutDashboard, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";


import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";

import type { GetTenantsResponse, Tenant } from "@mkl-iam/back/src/tenants/model";
import type { User } from "@mkl-iam/back/src/auth/model";

import { app } from "~/lib/api";
import { getToken } from "~/lib/auth";
import { Spinner } from "~/components/ui/spinner";
import { SiteHeader } from "~/components/site-header";


export type MainContext = {
  user: User;
  tenant: Tenant;
};

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  }, {
    name: "Employés",
    icon: Users,
    href: "/employees",
  }
]

export default function Main()
{
  const [ tenants, setTenants ] = useState<GetTenantsResponse>([]);
  const [ activeTenant, setActiveTenant ] = useState<Tenant | null>(null);
  const { user } = useOutletContext() as { user: User };

  useEffect(() => setActiveTenant(tenants[0]?.tenant ?? null), [ tenants ]);

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
      <AppSidebar user={user} tenants={tenants} menuItems={menuItems} activeTenant={activeTenant} setActiveTenant={setActiveTenant} />
      <SidebarInset>
        <SiteHeader itemName={ menuItems.find(item => item.href === location.pathname)?.name || "Dashboard" } />
        <div className="flex-1 p-6">
          {
            activeTenant ?
              <Outlet context={{ user, tenant: activeTenant }}/>
              :
              <div
                className="flex h-screen items-center justify-center gap-2 text-md text-muted-foreground"
              >
                <Spinner />
                Chargement des entreprises...
              </div>
          }
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
