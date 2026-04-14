import type { GetTenantsResponse } from "@mkl-iam/back/src/tenants/model";
import type { User } from "@mkl-iam/back/src/auth/model"
import { TenantsSwitcher } from "./tenants-switcher"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "~/components/ui/sidebar"
 

export function AppSidebar({ user, tenants }: { user: User; tenants: GetTenantsResponse }) {
  return (
    <Sidebar>
      <SidebarHeader>
        <TenantsSwitcher tenants={ tenants } />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={ user } />
      </SidebarFooter>
    </Sidebar>
  )
}
