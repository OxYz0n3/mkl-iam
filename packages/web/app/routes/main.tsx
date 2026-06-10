import { LayoutDashboard, Plug, Settings, ShieldCheck, Users } from "lucide-react";
import { Outlet, useNavigate, useOutletContext } from "react-router";
import { useEffect, useState } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteHeader } from "@/components/site-header";
import { AppSidebar } from "@/components/app-sidebar";
import { Spinner } from "@/components/ui/spinner";

import { localizeHref } from "@/paraglide/runtime";
import { m } from "@/paraglide/messages";

import { useTenants } from "@/hooks/use-tenants";

import type { Tenant } from "@mkl-iam/back/src/tenants/model";
import type { User } from "@mkl-iam/back/src/auth/model";


export type MainContext = {
  user: User;
  tenant: Tenant;
};

const menuItems = [
  {
    name: m.dashboard(),
    icon: LayoutDashboard,
    href: "/",
  }, {
    name: m.users(),
    icon: Users,
    href: "/users",
  }, {
    name: m.roles(),
    icon: ShieldCheck,
    href: "/roles",
  }, {
    name: m.integrations(),
    icon: Plug,
    href: "/integrations",
  }, {
    name: m.settings(),
    icon: Settings,
    href: "/settings",
  }
]


export default function Main()
{
  const { data: tenants, isLoading } = useTenants();
  const [ activeTenant, setActiveTenant ] = useState<Tenant | null>(null);
  const { user } = useOutletContext() as { user: User };
  const navigate = useNavigate();

  useEffect(() => {
    setActiveTenant(tenants[0] ?? null);

    if (!isLoading && !tenants?.length)
      navigate(localizeHref("/add-tenant"));
  }, [ tenants ]);

  return (
    <SidebarProvider>
      <TooltipProvider>
        <AppSidebar user={user} tenants={tenants} menuItems={menuItems} activeTenant={activeTenant} setActiveTenant={setActiveTenant} />
        <SidebarInset className="md:peer-data-[variant=inset]:m-3 md:peer-data-[variant=inset]:ml-0">
          <SiteHeader itemName={ menuItems.find(item => item.href === location.pathname)?.name || m.dashboard() } />
          <div className="flex-1 p-6">
            { activeTenant &&
              <Outlet context={{ user, tenant: activeTenant }}/>
            }
            { isLoading &&
              <div className="flex h-screen items-center justify-center gap-2 text-md text-muted-foreground">
                <Spinner />
                { m.loading_tenants() }
              </div>
            }
          </div>
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  )
}
