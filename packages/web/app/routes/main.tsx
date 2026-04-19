import { LayoutDashboard, Plug, Settings, Users } from "lucide-react";
import { Outlet, useOutletContext } from "react-router";
import { useEffect, useState } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { AppSidebar } from "@/components/app-sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useTenants } from "@/hooks/use-tenants";

import type { Tenant } from "@mkl-iam/back/src/tenants/model";
import type { User } from "@mkl-iam/back/src/auth/model";


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
  }, {
    name: "Intégrations",
    icon: Plug,
    href: "/integrations",
  }, {
    name: "Paramètres",
    icon: Settings,
    href: "/settings",
  }
]


export default function Main()
{
  const { data: tenants, isLoading } = useTenants();

  const [ activeTenant, setActiveTenant ] = useState<Tenant | null>(null);
  const { user } = useOutletContext() as { user: User };

  useEffect(() => setActiveTenant(tenants[0]?.tenant ?? null), [ tenants ]);

  return (
    <SidebarProvider>
      <AppSidebar user={user} tenants={tenants} menuItems={menuItems} activeTenant={activeTenant} setActiveTenant={setActiveTenant} />
      <SidebarInset className="md:peer-data-[variant=inset]:m-3 md:peer-data-[variant=inset]:ml-0">
        <SiteHeader itemName={ menuItems.find(item => item.href === location.pathname)?.name || "Dashboard" } />
        <div className="flex-1 p-6">
          { activeTenant &&
            <Outlet context={{ user, tenant: activeTenant }}/>
          }
          { isLoading &&
            <div className="flex h-screen items-center justify-center gap-2 text-md text-muted-foreground">
              <Spinner />
              Chargement des entreprises...
            </div>
          }
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
