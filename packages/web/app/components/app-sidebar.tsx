import type { LucideProps } from "lucide-react";
import { useNavigate } from "react-router";

import type { GetTenantsResponse, Tenant } from "@mkl-iam/back/src/tenants/model";
import type { User } from "@mkl-iam/back/src/auth/model"

import { TenantsSwitcher } from "@/components/tenants-switcher"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
 

export function AppSidebar({ user, tenants, menuItems, activeTenant, setActiveTenant }: {
  user: User;
  tenants: GetTenantsResponse;
  menuItems: {
    name: string;
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
    href: string;
  }[];
  activeTenant: Tenant | null;
  setActiveTenant: (tenant: Tenant) => void;
}) {
  const navigate = useNavigate();

  return (
    <Sidebar variant='inset'>
      <SidebarHeader>
        <TenantsSwitcher tenants={ tenants } activeTenant={ activeTenant } setActiveTenant={ setActiveTenant } />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  onClick={() => navigate(item.href)}
                  isActive={ document.location.pathname === item.href }
                >
                  <item.icon />
                  {item.name}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={ user } />
      </SidebarFooter>
    </Sidebar>
  )
}
